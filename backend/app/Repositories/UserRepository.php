<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use App\Repositories\Interfaces\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    protected $model;

    public function __construct(User $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->with(['primaryRole.permissions', 'roles.permissions'])->latest()->get();
    }

    public function find($id)
    {
        return $this->model->with(['primaryRole.permissions', 'roles.permissions'])->findOrFail($id);
    }

    public function create(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        
        $roleIds = $data['role_ids'] ?? [];
        if (!empty($data['role_id'])) {
            $roleIds[] = $data['role_id'];
        }

        // Auto-resolve role slug if role_id is provided
        if (!empty($data['role_id'])) {
            $role = Role::find($data['role_id']);
            if ($role) {
                $data['role'] = $role->slug;
            }
        } elseif (!empty($data['role'])) {
            $role = Role::where('slug', $data['role'])->first();
            if ($role) {
                $data['role_id'] = $role->id;
                $roleIds[] = $role->id;
            }
        }

        unset($data['role_ids']);

        $user = $this->model->create($data);

        if (!empty($roleIds)) {
            $user->roles()->sync(array_unique($roleIds));
        }

        return $user->load(['primaryRole', 'roles']);
    }

    public function update($id, array $data)
    {
        $user = $this->model->findOrFail($id);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $roleIds = $data['role_ids'] ?? null;
        if (!empty($data['role_id'])) {
            $role = Role::find($data['role_id']);
            if ($role) {
                $data['role'] = $role->slug;
            }
        }

        unset($data['role_ids']);

        $user->update($data);

        if ($roleIds !== null) {
            $user->roles()->sync(array_unique($roleIds));
        } elseif (!empty($data['role_id'])) {
            $user->roles()->syncWithoutDetaching([$data['role_id']]);
        }

        return $user->load(['primaryRole', 'roles']);
    }

    public function delete($id)
    {
        $user = $this->model->findOrFail($id);
        $user->roles()->detach();
        return $user->delete();
    }

    public function agents()
    {
        return $this->model->where(function ($q) {
            $q->where('role', 'agent')
              ->orWhereHas('roles', function ($rq) {
                  $rq->whereIn('slug', ['agent', 'logistics-agent', 'driver']);
              });
        })->where('is_active', true)->get();
    }
}
