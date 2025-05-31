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
        return $this->hasOne(PropertyCoordinate::class);
    }
}
