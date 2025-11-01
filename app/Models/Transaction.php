<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table = 'transactions';

    protected $guarded = [];

    public function deal(){
        return $this->belongsTo(Deal::class);
    }

    public function buyer(){
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function agent(){
        return $this->belongsTo(User::class, 'primary_agent_id');
    }

    public function inquiry(){
        return $this->belongsTo(Inquiry::class);
    }

    public function property(){
        return $this->belongsTo(Property::class);
    }



}
