<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Inertia\Inertia;

class AgentPropertyController extends Controller
{
    public function index()
    {
        $properties = Property::with(['features', 'seller'])
            ->where(function ($query) {
                $query->where('status', 'Unassigned')
                    ->orWhere('allow_multi_agents', true);
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('Agent/Properties/SellerPostProperty', [
            'properties' => $properties
        ]);
    }

    public function show(Property $property)
    {
        $property = $property->with(['seller:id,name,contact_number,email,photo_url', 'images', 'coordinate', 'features', 'coordinate'])->find($property->id);

        return Inertia::render('Agent/Properties/PropertyDetails', [
            'property' => $property
        ]);
    }
}
