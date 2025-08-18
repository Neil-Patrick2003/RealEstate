<?php

namespace App\Services;

use App\Models\PropertyListing;

class PropertyListingService
{
    public function store($property, $user)
    {
        $brokerId = null;
        $agentId = null;

        // Assign based on role
        if ($user->role === 'Broker') {
            $brokerId = $user->id;
        } elseif ($user->role === 'Agent') {
            $agentId = $user->id;
        }

        return PropertyListing::create([
            'property_id' => $property->id,
            'agent_id'    => $agentId,
            'broker_id'   => $brokerId,
            'seller_id'   => $property->seller_id,
        ]);
    }
}
