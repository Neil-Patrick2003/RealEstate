<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\PropertyListing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyListingController extends Controller
{
    public function index(Request $request)
    {

        $properties = PropertyListing::with('property')
            ->with('seller')
            ->where('agent_id', auth()->id())
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                return $q->where('status', '=', $request->status);
            })
            ->orderByDesc('created_at')
            ->paginate($request->get('items_per_page', 10));

        $propertiesCount = PropertyListing::where('agent_id', auth()->id())->count();

        $forPublishCount = PropertyListing::where('status', 'for_publish')->count();
        $publishedCount = PropertyListing::where('status', 'published')->count();
        $soldCount = PropertyListing::where('status', 'sold')->count();





        return Inertia::render('Agent/PropertyListing/Properties', [
            'properties' => $properties,
            'propertiesCount' => $propertiesCount,
            'forPublishCount' => $forPublishCount,
            'publishedCount' => $publishedCount,
            'soldCount' => $soldCount,
        ]);
    }
}
