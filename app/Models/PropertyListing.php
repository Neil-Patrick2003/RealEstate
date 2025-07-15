<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyListing extends Model
{
    protected $fillable = ['property_id', 'agent_id', 'seller_id', 'status'];

    public function property(){
        return $this->belongsTo(Property::class);
    }

    public function agent(){
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function seller(){
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function deal(){
        return $this->hasMany(Deal::class);
    }
}
