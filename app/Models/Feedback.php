<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Feedback extends Model
{

    protected $table = 'feedbacks';
    protected $guarded = [];

    protected $casts = [
        'characteristics' => 'array',
    ];

    public function characteristics(): HasMany
    {
        return $this->hasMany(FeedbackCharacteristic::class);
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function sender(){
        return $this->belongsTo(User::class, 'sender_id');
    }



}
