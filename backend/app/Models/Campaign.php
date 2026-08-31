<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function totalDonations()
    {
        return $this->donations()->count();
    }

    public function totalQuantity()
    {
        return DonationItem::whereHas('donation', function ($q) {
            $q->where('campaign_id', $this->id);
        })->sum('quantity');
    }
}
