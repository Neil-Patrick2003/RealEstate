<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\PropertyTripping;
use App\Notifications\TrippingResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrippingController extends Controller
{

    public function index()
    {
        $trippings = PropertyTripping::with('property:id,title,image_url,address', 'buyer:id,name,email')
            ->where('broker_id', auth()->id())
            ->latest()
            ->get();



        return Inertia::render('Broker/Tripping/Index', [
            'trippings' => $trippings,
        ]);
    }


    public function update(Request $request, $id, $action)
    {

        $status = ucfirst(strtolower($action));

        if($status == 'Accept'){
            $status = 'accepted';
        }
        else if($status == 'Reject'){
            $status = 'rejected';
        }
        else if($status == 'Complete'){
            $status = 'completed';
        }
        else{
            $status = 'Cancelled';
        }

        $tripping = PropertyTripping::findOrFail($id);

        // Update status
        $tripping->status = $status;
        $tripping->save();

        $buyer = $tripping->buyer;

        $buyer->notify(new TrippingResponse([
            'agent_name' => $tripping->broker->name,
            'property_title' => $tripping->property->title,
            'status' => $status,
        ]));

        if ($request->wantsJson()) {
            return response()->json([
                'message' => "Tripping {$status} successfully.",
                'data' => $tripping,
            ]);
        }

        return redirect()
            ->back()
            ->with('success', "Tripping {$status} successfully.");
    }


}
