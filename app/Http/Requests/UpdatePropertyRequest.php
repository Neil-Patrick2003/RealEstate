<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:3000',
            'property_type' => 'nullable|string',
            'property_sub_type' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'address' => 'nullable|string|max:255',
            'lot_area' => 'nullable|numeric|min:0',
            'floor_area' => 'nullable|numeric|min:0',
            'total_rooms' => 'nullable|integer|min:0|max:10',
            'total_bedrooms' => 'nullable|integer|min:0|max:10',
            'total_bathrooms' => 'nullable|integer|min:0|max:10',
            'car_slots' => 'nullable|integer|min:0|max:10',

            // Main image (optional on update)
            'image_url' => 'nullable|file|image|max:5120', // 5MB limit

            // Additional images
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'file|image|max:5120',

            // Features
            'feature_name' => 'nullable|array',
            'feature_name.*' => 'string|max:255',

            // Coordinates
            'boundary' => 'nullable|array',
            'pin' => 'nullable|array',

            // Other flags
            'isPresell' => 'boolean',
            'allowMultipleAgent' => 'nullable|boolean',

            // Agents
            'agent_ids' => 'nullable|array',
            'agent_ids.*' => 'exists:users,id',
        ];
    }
}
