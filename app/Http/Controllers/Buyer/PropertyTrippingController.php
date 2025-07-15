<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\PropertyTripping;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyTrippingController extends Controller
{


    public function index(){

        $trippings = PropertyTripping::with('property', 'agent')
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
            'agent_id' => 'required',
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
            'status' => 'pending',
            'notes' => $validated['notes'],
        ]);

        return redirect()->back()->with('success', 'Schedule tripping successfully.' );
    }
}
