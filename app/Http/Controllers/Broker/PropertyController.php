<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Developer;
use App\Models\Property;
use App\Models\PropertyCoordinate;
use App\Models\PropertyFeature;
use App\Models\PropertyImage;
use App\Models\PropertyListing;
use App\Models\User;
use App\Notifications\NewProperty;
use App\Services\PropertiesService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function index(Request $request)
    {

        $properties = PropertyListing::with('property')
            ->where('broker_id', auth()->id())
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

    public function create()
    {

        $developers = Developer::all('id', 'name', 'company_logo');
        return Inertia::render('Broker/Property/Create', [
            'developers' => $developers,
        ]);
    }

    public function store(StorePropertyRequest $request, PropertiesService $propertiesService)
    {
        $validated = $request->validated();

        $files = [
            'image_url' => $request->file('image_url'),
            'image_urls' => $request->file('image_urls'),
        ];

        $property = $propertiesService->store($validated, $files, auth()->user());

        PropertyListing::create([
            'property_id' => $property->id,
            'broker_id' => auth()->id(),
            'Status' => 'Published'
        ]);

        return redirect()->back()->with('success', 'Property has been created.');
    }

    public function edit(PropertyListing $propertyListing)
    {
        $property = $propertyListing->property->load('coordinate', 'images', 'features');

        return Inertia::render('Broker/Property/Edit', [
            'property' => $property,
        ]);
    }


    public function update(UpdatePropertyRequest $request, Property $property, PropertiesService $propertiesService)
    {

        $files = [
            'image_url' => $request->file('image_url'),
            'image_urls' => $request->file('image_urls'),
        ];

        $propertiesService->update($request, $property, $files);
    }

}
