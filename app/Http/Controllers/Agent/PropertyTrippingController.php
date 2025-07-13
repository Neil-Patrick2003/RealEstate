<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\PropertyTripping;
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
