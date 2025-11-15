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

    public function developer()
    {
        return $this->belongsTo(Developer::class);
    }

    public function blocks()
    {
        return $this->hasMany(Block::class);
    }

    public function house_types()
    {
        return $this->hasMany(HouseType::class);
    }

    public function inventoryPools()
    {
        return $this->hasMany(InventoryPool::class);
    }
}
