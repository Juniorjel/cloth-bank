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

    public function getUrlAttribute($value)
    {
        if (empty($value)) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        $clean = ltrim($value, '/');

        if (!app()->runningInConsole() && request()) {
            return request()->root() . '/' . $clean;
        }

        return url($clean);
    }
}
