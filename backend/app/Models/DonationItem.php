<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationItem extends Model
{
    protected $fillable = [
        'donation_id',
        'cloth_type_id',
        'quantity',
        'note',
    ];

    public function donation()
    {
        return $this->belongsTo(Donation::class);
    }

    public function clothType()
    {
        return $this->belongsTo(ClothType::class);
    }

    public function images()
    {
        return $this->hasMany(DonationItemImage::class);
    }
}
