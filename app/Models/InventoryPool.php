<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryPool extends Model
{
    protected $table = 'inventory_pools';

    protected $fillable = ['id', 'project_id', 'block_id', 'house_type_id', 'reserved', 'sold', 'held'];

    public function project(){
        return $this->belongsTo('App\Models\Project');
    }

    public function block(){
        return $this->belongsTo('App\Models\Block');
    }

    public function house_type(){
        return $this->belongsTo('App\Models\HouseType');
    }


}
