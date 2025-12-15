<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Models\PropertyCoordinate;
use App\Models\PropertyFeature;
use App\Models\PropertyImage;
use App\Models\PropertyListing;
use App\Models\User;
use App\Notifications\NewProperty;
use App\Services\PropertiesService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PropertyController extends Controller
{
    public function index(Request $request){

        $allCount = Property::where('seller_id', '=', Auth::id())->count();

        $publishedCount = Property::where('seller_id', '=', Auth::id())
            ->where('status', 'Published')
            ->count();

        $unassignedCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'Unassigned')
        ->count();

        $assignedCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'Assigned')
        ->count();

        $rejectedCount = Property::where('seller_id', '=', Auth::id())
        ->where('status', 'rejected')
        ->count();

        $properties = Property::where('seller_id', '=', Auth::id())
        ->when($request->search, function ($q) use ($request) {
            return $q->where('title', 'like', '%' . $request->search . '%');
        })
        ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
            return $q->where('status', '=', $request->status );
        })
            ->latest()
            ->paginate($request->items_per_page, ['*'], 'page', $request->input('page', 1));

        return Inertia::render('Seller/Properties/Index', [
            'properties' => $properties,
            'all' => $allCount,
            'unassigned' => $unassignedCount,
            'assigned' => $assignedCount,
            'rejected' => $rejectedCount,
            'published' => $publishedCount,
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

        if (!empty($validated['agent_ids'])) {
            $listing = PropertyListing::create([
                'property_id' => $property->id,
                'seller_id' => auth()->id(),
                'Status' => 'Published'
            ]);

            $listing->agents()->attach($validated['agent_ids']);

            foreach ($validated['agent_ids'] as $agent_id) {
                $agent = User::find($agent_id);
                $agent->notify(new NewProperty($property));
            }

            return redirect()->back()->with('success', 'Property has been created.');
        }

        $agents = User::where('role', 'Agent')->get();

        foreach ($agents as $agent) {
            $agent->notify(new NewProperty($property));
        }

        return redirect()->back()->with('success', 'Property has been created.');
    }


    public function show(Property $property){

        $property = $property->load('images', 'coordinate', 'features');

        return Inertia::render('Seller/Properties/ShowProperty', [
            'property' => $property
        ]);
    }

    public function edit(Property $property){
        $property = $property->load('images', 'coordinate', 'features');

        return Inertia::render('Seller/Properties/EditProperty', [
            'property' => $property

        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property, PropertiesService $propertiesService)
    {

        $files = [
            'image_url' => $request->file('image_url'),
            'image_urls' => $request->file('image_urls'),
        ];

        $propertiesService->update($request, $property, $files);

        return redirect()->back()->with('success', 'Property updated successfully.');
    }

    public function destroy($id)
    {
        $property = Property::findOrFail($id);

        if ($property->property_listing) {
            return redirect()->back()->with('error', 'Property is assigned to a listing. Please unassign it first.');
        }

        $property->images()->delete();
        $property->features()->delete();
        $property->coordinate()->delete();

        $property->delete();

        return redirect()->back()->with('success', 'Deleted property successfully!');
    }




}
