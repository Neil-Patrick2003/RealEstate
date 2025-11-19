<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyListing extends Model
{
    protected $guarded = [];

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

    public  function broker(){
        return $this->belongsTo(User::class, 'broker_id');
    }

    public function agents(){
        return $this->belongsToMany(User::class, 'property_listing_agents', 'property_listing_id', 'agent_id');
    }



    public function deals()
    {
        return $this->hasMany(Deal::class, 'property_listing_id');
    }

    public function buyers()
    {
        return $this->hasManyThrough(User::class, Deal::class, 'property_listing_id', 'id', 'id', 'buyer_id');
    }

    public function inquiries()
    {
        return $this->hasManyThrough(
            Inquiry::class,
            Property::class,
            'listing_id',   // Foreign key on properties table
            'property_id',  // Foreign key on inquiries table
            'id',           // Local key on listings table
            'id'            // Local key on properties table
        );
    }




}
