<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Block extends Model
{
    protected $table = 'blocks';

    protected $fillable = [
        'project_id',
        'block_code',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function inventoryPools(): HasMany
    {
        return $this->hasMany(InventoryPool::class);
    }
}
