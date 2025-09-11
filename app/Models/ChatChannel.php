<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ChatChannel extends Model
{
    /**
     * The attributes that are mass assignable.
     */
    protected $guarded = [];

    protected $table = 'chat_channels';

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'chat_channel_members', 'channel_id', );
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ChannelMessage::class, 'channel_id');
    }

    public function firstMessage(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ChannelMessage::class, 'channel_id')->latest();
    }

}
