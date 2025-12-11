<?php

namespace App\Services;

use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PropertyFeature;
use App\Models\PropertyCoordinate;

class PropertiesService
{
    public function store(array $validated, $files, $user)
    {
        // Determine whether the user is a broker or seller
        $brId = null;
        $sellerId = null;

        if ($user->role === 'Broker') {
            $broker_id = $user->id;
        } elseif ($user->role  === 'Seller') {
            $sellerId = $user->id;
        }

        // Handle main image
        $propertyImageUrl = null;
        if (!empty($files['image_url'])) {
            $file = $files['image_url'];
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $propertyImageUrl = $file->storeAs('images', $filename, 'public');
        }

        $status = !empty($validated['agent_ids']) ? 'Assigned' : 'Unassigned';

        $property = Property::create([
            'seller_id' => $sellerId,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'property_type' => $validated['property_type'],
            'sub_type' => $validated['property_sub_type'],
            'price' => $validated['price'],
            'address' => $validated['address'],
            'status' => $status,
            'lot_area' => $validated['lot_area'],
            'floor_area' => $validated['floor_area'],
            'total_rooms' => $validated['total_rooms'],
            'bedrooms' => $validated['total_bedrooms'],
            'bathrooms' => $validated['total_bathrooms'],
            'car_slots' => $validated['car_slots'],
            'isPresell' => $validated['isPresell'] ?? false,
            'image_url' => $propertyImageUrl,
            'allow_multi_agents' => $validated['allowMultipleAgent'],
        ]);



        // Upload multiple images
        if (!empty($files['image_urls'])) {
            foreach ($files['image_urls'] as $file) {
                $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $storedPath = $file->storeAs('images', $filename, 'public');

                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_url' => $storedPath,
                ]);
            }
        }



        // Property features
        if (!empty($validated['feature_name'])) {
            foreach ($validated['feature_name'] as $feature) {
                PropertyFeature::create([
                    'property_id' => $property->id,
                    'name' => $feature,
                ]);
            }
        }

        // Boundary coordinates (polygon)
        if (!empty($validated['boundary'])) {
            PropertyCoordinate::create([
                'property_id' => $property->id,
                'coordinates' => $validated['boundary'],
                'type' => 'polygon',
            ]);
        }

        // Pin coordinates (marker)
        if (!empty($validated['pin'])) {
            PropertyCoordinate::create([
                'property_id' => $property->id,
                'coordinates' => [
                    'lat' => $validated['pin']['lat'],
                    'lng' => $validated['pin']['lng'],
                ],
                'type' => 'marker',
            ]);
        }

        return $property;
    }


    public function update(UpdatePropertyRequest $request, Property $property, $files)
    {
        $propertyImageUrl = null;


        $validated = $request->validated();

        $property->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'property_type' => $validated['property_type'],
            'sub_type' => $validated['sub_type'],
            'price' => $validated['price'],
            'address' => $validated['address'],
            'lot_area' => $validated['lot_area'],
            'floor_area' => $validated['floor_area'],
            'total_rooms' => $validated['total_rooms'],
            'bedrooms' => $validated['total_bedrooms'] ?? null,
            'bathrooms' => $validated['total_bathrooms'] ?? null,
            'car_slots' => $validated['car_slots'],
            'isPresell' => (bool) $validated['isPresell'],
            'allow_multi_agents' => (bool) $validated['allowMultipleAgent'],
        ]);

        if (!empty($files['image_url'])) {
            $file = $files['image_url'];
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $propertyImageUrl = $file->storeAs('images', $filename, 'public');

            $property->update([
                'image_url' => $propertyImageUrl,
            ]);
        }

        $property->features()->delete();
        if (!empty($validated['feature_name'])) {
            foreach ($validated['feature_name'] as $feature) {
                PropertyFeature::create([
                    'property_id' => $property->id,
                    'name' => $feature,
                ]);
            }
        }

        if($request->image_to_detele !== null){
            foreach ($request->image_to_detele as $item){
                $property->images()->where('id', $item)->delete();
            }
//            $property->images()->where('id', $request->image_to_detele)->delete();
        }


        // Upload multiple images
        if (!empty($files['image_urls'])) {
            foreach ($files['image_urls'] as $file) {
                $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $storedPath = $file->storeAs('images', $filename, 'public');

                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_url' => $storedPath,
                ]);
            }
        }

        $property->coordinate()->delete();
        if ($validated['boundary']) {
            $property->coordinate()->create([
                'type' => 'polygon',
                'coordinates' => $validated['boundary']
            ]);
        }
        if ($validated['pin']) {
            $property->coordinate()->create([
                'type' => 'marker',
                'coordinates' => $validated['pin']
            ]);
        }

        return redirect()->back()->with('success', 'Property updated successfully.');
    }
}
