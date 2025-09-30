<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $casts = [
        'isPresell' => 'boolean',
    ];
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
        'image_url',
        'allow_multi_agents',
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



    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function inquiries()
    {
        return $this->hasMany(Inquiry::class);
    }

    public function property_listing()
    {
        return $this->hasOne(PropertyListing::class);
    }

    public function favourites(){
        return $this->hasMany(Favourite::class);
    }

    public function trippings()
    {
        return $this->hasMany(PropertyTripping::class);
    }

    public function developers()
    {
        return $this->belongsTo(Developer::class);

    }

    public function listings()
    {
        return $this->hasMany(PropertyListing::class);
    }

    public function developer(){
        return $this->belongsTo(Developer::class);
    }



}
