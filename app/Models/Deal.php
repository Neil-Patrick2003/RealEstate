<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    protected $guarded = [];

    public function property_listing(){
        return $this->belongsTo(PropertyListing::class);
    }

    public function buyer(){
        return $this->belongsTo(User::class);
    }

}
