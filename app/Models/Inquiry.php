<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = ['agent_id', 'seller_id', 'buyer_id', 'status'];

    public function user ()
    {
        return $this->belongsTo(User::class);
    }
}
