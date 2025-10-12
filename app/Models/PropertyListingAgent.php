<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyListingAgent extends Model
{
    protected $guarded = [];

    public function property_listing(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(PropertyListing::class);
    }

    public function agent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
