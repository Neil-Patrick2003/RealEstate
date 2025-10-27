<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
