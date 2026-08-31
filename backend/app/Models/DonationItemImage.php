<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationItemImage extends Model
{
    protected $fillable = ['donation_item_id', 'path', 'url'];

    public function donationItem()
    {
        return $this->belongsTo(DonationItem::class);
    }
}
