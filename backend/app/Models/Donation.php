<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'campaign_id',
        'donor_name',
        'donor_phone',
        'donor_email',
        'collection_type',
        'latitude',
        'longitude',
        'address',
        'status',
        'rejection_reason',
        'accepted_by',
        'accepted_at',
        'rejected_by',
        'rejected_at',
        'verified_quantity',
        'agent_id',
        'picked_up_at',
        'delivered_at',
        'verified_at',
    ];

    protected $casts = [
        'accepted_at'   => 'datetime',
        'rejected_at'   => 'datetime',
        'picked_up_at'  => 'datetime',
        'delivered_at'  => 'datetime',
        'verified_at'   => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function acceptedBy()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function items()
    {
        return $this->hasMany(DonationItem::class);
    }

    // Computed total across all items
    public function getTotalQuantityAttribute()
    {
        return $this->items->sum('quantity');
    }
}
