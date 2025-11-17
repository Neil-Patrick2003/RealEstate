<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'projects';

    protected $fillable = [
        'id',
        'developer_id',
        'name',
        'type',
        'address',
        'status',
        'project_img'
    ];

    public function developer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Developer::class);
    }

    public function blocks(): Project|\Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Block::class);
    }

    public function house_types(): Project|\Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HouseType::class);
    }

    public function inventoryPools(): Project|\Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InventoryPool::class);
    }

    public function properties(): Project|\Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Property::class);
    }
}

