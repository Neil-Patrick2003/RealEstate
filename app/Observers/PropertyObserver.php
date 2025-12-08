<?php

namespace App\Observers;

use App\Models\Property;
use App\Services\RecommendationService;

class PropertyObserver
{
    public function created(Property $property): void
    {
        if ($property->status === 'Published') {
            app(RecommendationService::class)
                ->notifyBuyersForNewProperty($property);
        }
    }

    public function updated(Property $property): void
    {
        if ($property->wasChanged('status') && $property->status === 'Published') {
            app(RecommendationService::class)
                ->notifyBuyersForNewProperty($property);
        }
    }
}
