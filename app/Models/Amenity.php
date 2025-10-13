<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Amenity extends Model
{
    protected $guarded = [];

    public function developers() {
        return $this->belongsToMany(\App\Models\Developer::class, 'amenity_developer', 'amenity_id', 'developer_id');
    }
}
