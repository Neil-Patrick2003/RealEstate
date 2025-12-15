<?php

namespace App\Services;

use App\Http\Requests\UpdatePropertyRequest;
use App\Models\Property;
use App\Models\PropertyCoordinate;
use App\Models\PropertyFeature;
use App\Models\PropertyImage;

class PropertiesService
{
    public function store(array $validated, $files, $user)
    {
        $brokerId = null;
        $sellerId = null;

        if ($user->role === 'Broker') {
            $brokerId = $user->id;
        } elseif ($user->role === 'Seller') {
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
            'seller_id'          => $sellerId,
            // if you have broker_id column, uncomment:
            // 'broker_id'       => $brokerId,

            'title'              => $validated['title'],
            'description'        => $validated['description'],
            'property_type'      => $validated['property_type'],
            'sub_type'           => $validated['property_sub_type'],
            'price'              => $validated['price'],
            'address'            => $validated['address'],
            'status'             => $status,
            'lot_area'           => $validated['lot_area'],
            'floor_area'         => $validated['floor_area'],
            'total_rooms'        => $validated['total_rooms'],
            'bedrooms'           => $validated['total_bedrooms'],
            'bathrooms'          => $validated['total_bathrooms'],
            'car_slots'          => $validated['car_slots'],

            // ✅ safe booleans
            'isPresell'          => (bool) ($validated['isPresell'] ?? false),
            'allow_multi_agents' => (bool) ($validated['allowMultipleAgent'] ?? false),
            'is_rush'            => (bool) ($validated['is_rush'] ?? false),

            'image_url'          => $propertyImageUrl,
        ]);

        // Upload multiple images
        if (!empty($files['image_urls'])) {
            foreach ($files['image_urls'] as $file) {
                $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $storedPath = $file->storeAs('images', $filename, 'public');

                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_url'   => $storedPath,
                ]);
            }
        }

        // Property features
        if (!empty($validated['feature_name'])) {
            foreach ($validated['feature_name'] as $feature) {
                PropertyFeature::create([
                    'property_id' => $property->id,
                    'name'        => $feature,
                ]);
            }
        }

        // Boundary coordinates (polygon)
        if (!empty($validated['boundary'])) {
            PropertyCoordinate::create([
                'property_id'  => $property->id,
                'coordinates'  => $validated['boundary'],
                'type'         => 'polygon',
            ]);
        }

        // Pin coordinates (marker)
        if (!empty($validated['pin']) && !empty($validated['pin']['lat']) && !empty($validated['pin']['lng'])) {
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


        $validated = $request->validated();

        $isPresell = (bool) ($validated['isPresell'] ?? false);
        $allowMulti = (bool) ($validated['allowMultipleAgent'] ?? false);
        $isRush = (bool) ($validated['is_rush'] ?? false);




        $property->update([
            'title'              => $validated['title'],
            'description'        => $validated['description'],
            'property_type'      => $validated['property_type'],
            'sub_type'           => $validated['sub_type'],
            'price'              => $validated['price'],
            'address'            => $validated['address'],
            'lot_area'           => $validated['lot_area'],
            'floor_area'         => $validated['floor_area'],
            'total_rooms'        => $validated['total_rooms'],
            'bedrooms'           => $validated['total_bedrooms'] ?? null,
            'bathrooms'          => $validated['total_bathrooms'] ?? null,
            'car_slots'          => $validated['car_slots'],
            'isPresell'          => $isPresell,
            'allow_multi_agents' => $allowMulti,
            'is_rush'            => $isRush,
        ]);

        // Handle main image update
        if (!empty($files['image_url'])) {
            $file = $files['image_url'];
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $propertyImageUrl = $file->storeAs('images', $filename, 'public');

            $property->update([
                'image_url' => $propertyImageUrl,
            ]);
        }

        // Replace features
        $property->features()->delete();
        if (!empty($validated['feature_name'])) {
            foreach ($validated['feature_name'] as $feature) {
                PropertyFeature::create([
                    'property_id' => $property->id,
                    'name'        => $feature,
                ]);
            }
        }

        // Delete selected images
        $toDelete = $request->input('image_to_detele', []);
        if (!empty($toDelete)) {
            foreach ((array) $toDelete as $item) {
                $property->images()->where('id', $item)->delete();
            }
        }

        // Upload multiple images
        if (!empty($files['image_urls'])) {
            foreach ($files['image_urls'] as $file) {
                $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $storedPath = $file->storeAs('images', $filename, 'public');

                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_url'   => $storedPath,
                ]);
            }
        }

        // Replace coordinates
        $property->coordinate()->delete();

        if (!empty($validated['boundary'])) {
            $property->coordinate()->create([
                'type'        => 'polygon',
                'coordinates' => $validated['boundary'],
            ]);
        }

        if (!empty($validated['pin'])) {
            $property->coordinate()->create([
                'type'        => 'marker',
                'coordinates' => $validated['pin'],
            ]);
        }

        return redirect()->back()->with('success', 'Property updated successfully.');
    }
}
