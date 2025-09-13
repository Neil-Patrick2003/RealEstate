<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $guarded = [];

    public function seller (): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function agent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
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

    public function scopeStatus(Builder $query, string $status)
    {
        if ($status === 'All') {
            return $query;
        }
        elseif ($status === 'Scheduled') {
            return $query->where('status', 'Follow-Up Scheduled');
        }
        elseif ($status === 'Cancelled') {
            return $query->where('status', 'like', '%Cancelled%');
        }

        elseif ($status === 'Closed') {
            return $query->where('status', 'like', '%Closed%');
        } else {
            return $query->where('status', $status);
        }
    }

    public function feedback()
    {
        return $this->hasOne(Feedback::class);
    }

    public function broker(){
        return $this->belongsTo(User::class, 'broker_id');
    }

}
