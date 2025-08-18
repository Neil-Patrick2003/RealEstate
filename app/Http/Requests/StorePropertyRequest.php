<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:3000',
            'property_type' => 'required|string',
            'property_sub_type' => 'required|string',
            'price' => 'required|numeric|min:0',
            'address' => 'required|string|max:255',
            'lot_area' => 'nullable|numeric|min:0',
            'floor_area' => 'nullable|numeric|min:0',
            'total_rooms' => 'nullable|integer|min:0|max:10',
            'total_bedrooms' => 'nullable|integer|min:0|max:10',
            'total_bathrooms' => 'nullable|integer|min:0|max:10',
            'car_slots' => 'nullable|integer|min:0|max:10',
            'image_url' => 'required|file|image',
            'image_urls.*' => 'file|image',
            'feature_name' => 'required|array',
            'feature_name.*' => 'string|max:255',
            'boundary' => 'required|array',
            'pin' => 'nullable|array',
            'isPresell' => 'boolean',
            'allowMultipleAgent' => 'nullable|boolean',
            'agent_ids' => 'nullable|array',
            'agent_ids.*' => 'exists:users,id',
        ];
    }
}
