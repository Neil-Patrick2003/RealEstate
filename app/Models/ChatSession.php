<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    protected $guarded = [];

    protected $casts = [
        'last_activity_at' => 'datetime',
    ];

    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}
