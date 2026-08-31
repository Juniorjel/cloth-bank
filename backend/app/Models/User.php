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

    protected $appends = ['permissions'];

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isAgent()
    {
        return $this->role === 'agent';
    }

    public function isUser()
    {
        return $this->role === 'user' || (!$this->isAdmin() && !$this->isAgent());
    }

    public function getPermissionsAttribute()
    {
        if ($this->isAdmin()) {
            return [
                'manage_all',
                'view_dashboard',
                'manage_campaigns',
                'manage_cloth_types',
                'manage_donations',
                'assign_driver',
                'verify_intake',
                'manage_users',
                'generate_qr',
                'create_donation',
                'view_my_donations',
            ];
        }

        if ($this->isAgent()) {
            return [
                'view_assigned_tasks',
                'mark_picked_up',
                'mark_delivered',
            ];
        }

        return [
            'view_campaigns',
            'create_donation',
            'view_my_donations',
            'track_donation',
        ];
    }

    public function hasPermission($permission)
    {
        return in_array($permission, $this->permissions) || in_array('manage_all', $this->permissions);
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
