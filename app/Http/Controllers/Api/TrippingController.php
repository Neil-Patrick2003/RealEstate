<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyTripping;
use App\Notifications\TrippingResponse;
use Illuminate\Http\Request;

class TrippingController extends Controller
{
    public function index()
    {
        $trippings = PropertyTripping::with('property:id,title,image_url,address', 'buyer:id,name,email')
        ->where(
            'agent_id', auth()->id()
        )
        ->get();

        return [
            'data' => $trippings,
        ];
    }

    public function show($id)
    {
        $tripping = PropertyTripping::find($id);

        return [
            'data' => $tripping,
        ];
    }

    public function update(Request $request, $id, $action)
    {
        if($action === 'accept'){
            $status = 'accepted';
        }
        else{
            $status = 'declined';
        }

        $tripping = PropertyTripping::find($id);

        $tripping->update([
            'status' => $status,
        ]);

        $buyer = $tripping->buyer;
        $property = $tripping->property;
        $agent = $tripping->agent;

        $buyer->notify(new TrippingResponse([
            'agent_name' => $agent->name,
            'property_title' => $property->title,
            'status' => $status,
            'property_id' => $property->id,
            'buyer_id' => $tripping->buyer_id,
        ]));

        return [
            'success' => 'Tripping ' . $status . ' successfully.',
        ];
    }
}
