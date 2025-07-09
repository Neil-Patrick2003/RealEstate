<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = ['agent_id',  'buyer_id',  'seller_id',  'property_id', 'status'];

    public function seller ()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer(){
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function agent(){
        return $this->belongsTo(User::class, 'agent_id');
    }



    public function property (){
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function messages (){
        return $this->hasOne(Message::class, 'inquiry_id');

    }

    public function trippings ()
    {
        return $this->hasMany(PropertyTripping::class, 'inquiry_id');
    }


}
