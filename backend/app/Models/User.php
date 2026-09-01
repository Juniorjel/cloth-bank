<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'role_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active'         => 'boolean',
    ];

    protected $appends = ['permissions', 'role_name'];

    // Relationships
    public function primaryRole()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    // Role checks
    public function hasRole($roleSlug): bool
    {
        if ($this->role === $roleSlug) {
            return true;
        }

        if ($this->primaryRole && $this->primaryRole->slug === $roleSlug) {
            return true;
        }

        return $this->roles->contains('slug', $roleSlug);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin') || $this->hasRole('super-admin');
    }

    public function isAgent(): bool
    {
        return $this->hasRole('agent') || $this->hasRole('logistics-agent') || $this->hasRole('driver');
    }

    public function isUser(): bool
    {
        return !$this->isAdmin() && !$this->isAgent();
    }

    public function getRoleNameAttribute(): string
    {
        if ($this->primaryRole) {
            return $this->primaryRole->name;
        }

        $firstRole = $this->roles->first();
        if ($firstRole) {
            return $firstRole->name;
        }

        return ucfirst($this->role ?? 'User');
    }

    // Dynamic Permissions attribute
    public function getPermissionsAttribute(): array
    {
        // 1. Fetch permissions from assigned roles
        $dbPermissions = collect();

        if ($this->primaryRole && $this->primaryRole->relationLoaded('permissions')) {
            $dbPermissions = $dbPermissions->merge($this->primaryRole->permissions->pluck('slug'));
        } elseif ($this->primaryRole) {
            $dbPermissions = $dbPermissions->merge($this->primaryRole->permissions()->pluck('slug'));
        }

        if ($this->relationLoaded('roles')) {
            foreach ($this->roles as $role) {
                if ($role->relationLoaded('permissions')) {
                    $dbPermissions = $dbPermissions->merge($role->permissions->pluck('slug'));
                } else {
                    $dbPermissions = $dbPermissions->merge($role->permissions()->pluck('slug'));
                }
            }
        }

        if ($dbPermissions->isNotEmpty()) {
            return $dbPermissions->unique()->values()->toArray();
        }

        // 2. Fallback to default matrix based on legacy role string
        if ($this->isAdmin()) {
            return [
                'manage_all',
                'dashboard.view',
                'donations.view',
                'donations.create',
                'donations.verify',
                'donations.assign_driver',
                'donations.update_status',
                'campaigns.view',
                'campaigns.create',
                'campaigns.edit',
                'campaigns.delete',
                'cloth_types.manage',
                'users.view',
                'users.create',
                'users.edit',
                'users.delete',
                'roles.manage',
                'reports.view',
            ];
        }

        if ($this->isAgent()) {
            return [
                'dashboard.view',
                'donations.view',
                'donations.update_status',
                'view_assigned_tasks',
                'mark_picked_up',
                'mark_delivered',
            ];
        }

        return [
            'campaigns.view',
            'donations.create',
            'donations.view',
            'track_donation',
        ];
    }

    public function hasPermission($permission): bool
    {
        $perms = $this->permissions;
        return in_array($permission, $perms) || in_array('manage_all', $perms);
    }

    public function assignRole($role)
    {
        if (is_numeric($role)) {
            $this->role_id = $role;
            $this->save();
            $this->roles()->syncWithoutDetaching([$role]);
        } elseif (is_string($role)) {
            $roleModel = Role::where('slug', $role)->first();
            if ($roleModel) {
                $this->role_id = $roleModel->id;
                $this->role = $roleModel->slug;
                $this->save();
                $this->roles()->syncWithoutDetaching([$roleModel->id]);
            }
        } elseif ($role instanceof Role) {
            $this->role_id = $role->id;
            $this->role = $role->slug;
            $this->save();
            $this->roles()->syncWithoutDetaching([$role->id]);
        }
    }

    // Driver pickups
    public function donations()
    {
        return $this->hasMany(Donation::class, 'agent_id');
    }

    // Donor submissions
    public function submittedDonations()
    {
        return $this->hasMany(Donation::class, 'user_id');
    }
}
