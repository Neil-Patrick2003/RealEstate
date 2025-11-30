<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchHistory extends Model
{
    protected $table = 'search_histories';
    protected $guarded = [];

    protected $casts = [
        'categories'    => 'array',
        'subcategories' => 'array',
        'is_presell'    => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
