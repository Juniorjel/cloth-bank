<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    public function primaryUsers()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    public function hasPermission($permissionSlug): bool
    {
        return $this->permissions->contains('slug', $permissionSlug);
    }

    public function syncPermissions(array $permissionIds)
    {
        return $this->permissions()->sync($permissionIds);
    }
}
