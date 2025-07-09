<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyTripping extends Model
{
    protected $fillable = ['property_id','agent_id', 'buyer_id', 'inquiry_id', 'visit_date', 'visit_time', 'status', 'notes'];

    public function property(){
        return $this->belongsTo('App\Models\Property');
    }

    public function agent(){
        return $this->belongsTo('App\Models\User', 'agent_id');
    }

    public function buyer(){
        return $this->belongsTo('App\Models\User', 'buyer_id');
    }

    public function inquiry(){
        return $this->belongsTo('App\Models\Inquiry', 'inquiry_id');
    }

}
