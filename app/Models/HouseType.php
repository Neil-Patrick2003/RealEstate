<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseType extends Model
{
    protected $table = 'house_types';

    protected $guarded = [];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function inventoryPools()
    {
        return $this->hasMany(InventoryPool::class);
    }
}
