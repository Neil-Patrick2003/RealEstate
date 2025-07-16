<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyListing;
use http\Env\Request;
use Inertia\Inertia;

class BuyerController extends Controller
{
    public function index()
    {

    }

    public function allProperties(\Illuminate\Http\Request $request)
    {
        $properties = Property::where('status', 'Published')
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('title', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('type') && $request->type !== 'All', function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('property_type', 'like', '%' . $request->type . '%');
                });
            })
            ->get();

        $propertiesWithMap = Property::where('status', 'Published')
            ->with('coordinate')
            ->get();


        return Inertia::render('Buyer/Properties/Properties', [
            'properties' => $properties,
            'propertiesWithMap' => $propertiesWithMap,
        ]);


    }
}
