<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected  $guarded = [];

    public function image(){
        return $this->hasMany(PropertyImage::class);
    }
}
