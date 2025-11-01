<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryPool extends Model
{
    protected $table = 'inventory_pools';

    protected $guarded = [];

    protected $casts = [
        'total' => 'integer',
        'held' => 'integer',
        'reserved' => 'integer',
        'sold' => 'integer',
    ];


    public function project(){
        return $this->belongsTo('App\Models\Project');
    }

    public function block(){
        return $this->belongsTo('App\Models\Block');
    }

    public function house_type(){
        return $this->belongsTo('App\Models\HouseType');
    }

    public function getAvailableAttribute(): int
    {
        return (int)$this->total - (int)$this->held - (int)$this->reserved - (int)$this->sold;
    }


}
