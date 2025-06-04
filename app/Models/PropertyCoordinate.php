<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyCoordinate extends Model
{
     protected $fillable = ['property_id', 'coordinates', 'type'];

    protected $casts = [
        'coordinates' => 'array', // auto casts JSON to array and vice versa
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }


}
