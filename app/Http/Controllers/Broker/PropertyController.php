<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\PropertyListing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function index(Request $request)
    {

        $properties = PropertyListing::with('property', 'seller', 'agent')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($query) use ($search) {
                    $query->whereHas('seller', function ($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%');
                    })->orWhereHas('agent', function ($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%');
                    });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $status = $request->status;
                $query->where(function ($query) use ($status) {
                    $query->when($status && $status !== 'All', function ($q) use ($status) {
                        $q->where('status', 'like', '%' . $status . '%');
                    });
                });
            })


            ->latest()
            ->paginate((int) $request->get('items_per_page', 10));


        $allCount = PropertyListing::count();
        $publishedCount = PropertyListing::where('status', 'Published')->count();
        $assignedCount = PropertyListing::where('status', 'Assigned')->count();
        $unpublishedCount = PropertyListing::where('status', 'Unpublished')->count();

        return Inertia::render('Broker/Property/Index', [
            'properties' => $properties,
            'allCount' => $allCount,
            'publishedCount' => $publishedCount,
            'assignedCount' => $assignedCount,
            'unpublishedCount' => $unpublishedCount,
        ]);
    }

    public function publish(PropertyListing $propertyListing){
        $propertyListing->update([
            'status' => 'Published',
        ]);

        return redirect()->back()->with('success', 'Property Listing has been published.');
    }

    public function unpublish(PropertyListing $propertyListing){
        $propertyListing->update([
            'status' => 'Unpublished',
        ]);

        return redirect()->back()->with('success', 'Property Listing has been unpublished.');
    }

    public function show(PropertyListing $propertyListing){
        $property = PropertyListing::with('property.coordinate', 'property.images', 'property.features', 'seller', 'agent')->where('id', $propertyListing->id)->first();

        return Inertia::render('Broker/Property/Show', [
            'property' => $property,
        ]);
    }
}
