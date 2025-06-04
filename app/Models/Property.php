<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected  $guarded = [];

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
