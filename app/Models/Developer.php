<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Developer extends Model
{
    protected $guarded = [];

    public function properties(){
        return $this->hasMany(Property::class);
    }

    public function broker()
    {
        return $this->belongsTo(User::class, 'broker_id');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\Amenity::class, 'amenity_developer', 'developer_id', 'amenity_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

}
