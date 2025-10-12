<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyTripping;
use App\Models\User;
use App\Notifications\TrippingRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyTrippingController extends Controller
{


    public function index(){

        $trippings = PropertyTripping::with('property', 'agent', 'broker')
            ->where('buyer_id', auth()->id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Buyer/Trippins/Trippings' , [
            'trippings' => $trippings
        ]);
    }
    public function store(Request $request){


        //validate
        $validated = request()->validate([
            'property_id' => 'required',
            'agent_id' => 'nullable',
            'broker_id' => 'nullable',
            'inquiry_id' => 'required',
            'date' => 'required',
            'time' => 'required',
            'notes' => 'nullable|max:255',
        ]);

        //create tripping
        PropertyTripping::create([
            'property_id' => $validated['property_id'],
            'agent_id' => $validated['agent_id'],
            'buyer_id' => auth()->user()->id,
            'inquiry_id' => $validated['inquiry_id'],
            'visit_date' => $validated['date'],
            'visit_time' => $validated['time'],
            'broker_id' => $validated['broker_id'],
            'status' => 'pending',
            'notes' => $validated['notes'],
        ]);


        if (!empty($validated['agent_id'])) {
            $agent = User::find($validated['agent_id']);
            $property = Property::find($validated['property_id']);

            if ($agent) {
                $agent->notify(new TrippingRequest([
                    'buyer_name' => auth()->user()->name,
                    'property_title' => $property->title,
                ]));
            }
        } elseif (!empty($validated['broker_id'])) {
            $broker = User::find($validated['broker_id']);
            $property = Property::find($validated['property_id']);

            if ($broker) {
                $broker->notify(new TrippingRequest([
                    'buyer_name' => auth()->user()->name,
                    'property_title' => $property->title,
                ]));
            }
        }





        return redirect()->back()->with('success', 'Schedule tripping successfully.' );
    }
}
