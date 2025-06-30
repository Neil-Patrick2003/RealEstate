<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyListing extends Model
{
    protected $fillable = ['property_id', 'agent_id', 'status'];

    public function property(){
        return $this->belongsTo(Property::class);
    }

    public function agent(){
        return $this->belongsTo(User::class, 'agent_id');
    }
}
