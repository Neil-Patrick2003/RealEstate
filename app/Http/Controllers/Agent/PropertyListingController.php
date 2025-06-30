<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
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

        return Inertia::render('Agent/PropertyListing/Properties', [
            'properties' => $properties
        ]);
    }
}
