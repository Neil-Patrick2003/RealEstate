<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseType extends Model
{
    protected $table = 'house_types';

    protected $fillable = [
        'id', 'project_id', 'code', 'name', 'base_price', 'is_active'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function inventoryPools()
    {
        return $this->hasMany(InventoryPool::class);
    }
}
