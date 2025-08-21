<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyListing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyListingController extends Controller
{
    public function index(Request $request)
    {
        $properties = PropertyListing::with(['property', 'seller'])
            ->where('agent_id', auth()->id())

            // Search filter
            ->when($request->filled('search'), function ($query) use ($request) {
                $searchTerm = trim($request->search);
                $query->where(function ($q) use ($searchTerm) {
                    $q->orWhereHas('property', function ($subQuery) use ($searchTerm) {
                        $subQuery->where('title', 'like', "%{$searchTerm}%");
                    })->orWhereHas('seller', function ($subQuery) use ($searchTerm) {
                        $subQuery->where('name', 'like', "%{$searchTerm}%");
                    });
                });
            })

            // Status filter (excluding "All")
            ->when($request->filled('status') && $request->status !== 'All', function ($query) use ($request) {
                $query->where('status', $request->status);
            })

            // Property Type filter
            ->when($request->filled('property_type'), function ($query) use ($request) {
                $query->whereHas('property', function ($subQuery) use ($request) {
                    $subQuery->where('property_type', $request->property_type);
                });
            })

            // Sub Type filter
            ->when($request->filled('sub_type'), function ($query) use ($request) {
                $query->whereHas('property', function ($subQuery) use ($request) {
                    $subQuery->where('sub_type', $request->sub_type);
                });
            })

            // Location filter
            ->when($request->filled('location'), function ($query) use ($request) {
                $query->whereHas('property', function ($subQuery) use ($request) {
                    $subQuery->where('address', 'like', '%' . $request->location . '%');
                });
            })

            ->orderByDesc('created_at')
            ->paginate((int) $request->get('items_per_page', 10))
            ->withQueryString(); // important to keep filters during pagination

        // Stats
        $propertiesCount = PropertyListing::where('agent_id', auth()->id())->count();
        $forPublishCount = PropertyListing::where('status', 'for_publish')->count();
        $publishedCount = PropertyListing::where('status', 'published')->count();
        $soldCount = PropertyListing::where('status', 'sold')->count();

        // Return to Inertia view
        return Inertia::render('Agent/PropertyListing/Properties', [
            'properties' => $properties,
            'propertiesCount' => $propertiesCount,
            'forPublishCount' => $forPublishCount,
            'publishedCount' => $publishedCount,
            'soldCount' => $soldCount,
            'search' => $request->query('search'),
        ]);
    }

    public function show(PropertyListing $propertyListing)
    {
        $propertyListing->load(['property.coordinate', 'seller', 'property.images', 'property.features']);




        return Inertia::render('Agent/PropertyListing/SingleProperty', [
            'propertyListing' => $propertyListing,
        ]);
    }

    public function update(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        $property->update([
            'status' => "Published",
        ]);

        // Update the related property_listing (assuming one-to-one)
        if ($property->property_listing) {
            $property->property_listing->update([
                'status' => 'Published',
            ]);
        }

        return redirect()->back()->with('success', 'Property Published Successfully');
    }

}
