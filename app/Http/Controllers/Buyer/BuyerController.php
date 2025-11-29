<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Favourite;
use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BuyerController extends Controller
{
    public function index()
    {

        $properties = \App\Models\Property::with('coordinate')
            ->where('status', 'Published')
            ->latest()
            ->get();

        $inquiries = \App\Models\Inquiry::with('property', 'agent:id,name,email', 'broker:id,name,email')
            ->where('buyer_id', auth()->id())
            ->latest() // defaults to 'created_at' in descending order
            ->take(10) // limit to 10 results
            ->get();

        $saveCount = Favourite::where('user_id', auth()->id())->count();

        return Inertia::render('Buyer/Dashboard', [
            'properties' => $properties,
            'inquiries' => $inquiries,
            'saveCount' => $saveCount
        ]);
    }

}
