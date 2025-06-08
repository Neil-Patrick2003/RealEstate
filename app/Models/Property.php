<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'seller_id',
        'title',
        'description',
        'property_type',
        'sub_type',
        'price',
        'address',
        'status',
        'lot_area',
        'floor_area',
        'total_rooms',
        'bedrooms',
        'bathrooms',
        'car_slots',
        'isPresell',
        'image_url'
    ];

    public function images(){
        return $this->hasMany(PropertyImage::class);
    }

    public function features(){
        return $this->hasMany(PropertyFeature::class);
    }

    public function coordinate(){
        return $this->hasMany(PropertyCoordinate::class);
    }

    // Helper for getting boundary polygon (single)
    public function boundary()
    {
        return $this->hasOne(PropertyCoordinate::class)->where('type', 'polygon');
    }

    // Helper for getting marker pin (single)
    public function marker()
    {
        return $this->hasOne(PropertyCoordinate::class)->where('type', 'marker');
    }
}
