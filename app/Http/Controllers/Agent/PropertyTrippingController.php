<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\PropertyTripping;
use App\Notifications\TrippingRequest;
use App\Notifications\TrippingResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyTrippingController extends Controller
{
    public function index()
    {
        $trippings = PropertyTripping::with('property:id,title,image_url,address', 'buyer:id,name,email')
                ->where('agent_id', auth()->id())
                ->latest()
                ->get();

        return Inertia::render('Agent/Tripping/Trippings', [
            'trippings' => $trippings,
        ]);
    }

    public function accept(Request $request, $id)
    {
        $tripping = PropertyTripping::find($id);

        $tripping->update([
            'status' => 'accepted',
        ]);

        $buyer = $tripping->buyer;

        $property = $tripping->property;
        $agent = $tripping->agent;

        $buyer->notify(new TrippingResponse([
            'agent_name' => $agent->name,
            'property_title' => $property->title,
            'status' => 'Accepted',
            'property_id' => $property->id,
            'buyer_id' => $tripping->buyer_id,
        ]));

        return redirect()->back()->with('success', 'Tripping accepted');

    }


    public function complete(Request $request, $id)
    {
        $tripping = PropertyTripping::find($id);


        $tripping->update([
            'status' => 'completed',
        ]);

        $buyer = $tripping->buyer;

        $property = $tripping->property;
        $agent = $tripping->agent;

        $buyer->notify(new TrippingResponse([
            'agent_name' => $agent->name,
            'property_title' => $property->title,
            'status' => 'Accepted',
            'property_id' => $property->id,
            'buyer_id' => $tripping->buyer_id,
        ]));

        return redirect()->back()->with('success', 'Tripping accepted');

    }


    public function decline(Request $request, $id){
        $tripping = PropertyTripping::find($id);
        $tripping->update([
            'status' => 'declined',
        ]);

        return redirect()->back()->with('success', 'Tripping declined');
    }
}
