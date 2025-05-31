<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyFeature extends Model
{
    //relationship with properties(sanaol)
    public function properties(){
        return $this->belongsTo(Property::class);
    }
}
