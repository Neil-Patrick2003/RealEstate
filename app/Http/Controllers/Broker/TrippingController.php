<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\PropertyTripping;
use App\Notifications\TrippingResponse;
use Illuminate\Http\Request;

class TrippingController extends Controller
{
    public function index(Request $request)
    {
        // Only get the broker’s schedules once
        $schedules = PropertyTripping::with('property', 'buyer')
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->where('broker_id', auth()->id())
            ->latest()
        ->paginate($request->items_per_page, ['*'], 'page', $request->input('page', 1));


        // Use collection filtering without repeating broker_id
        $upcomingTrips = $schedules->where('status', 'Upcoming')->count();
        $pendingTrips = $schedules->where('status', 'Pending')->count();
        $pastTrips = $schedules->where('status', 'Completed')->count();
        $cancelledTrips = $schedules->where('status', 'Declined')->count();

        return inertia('Broker/Tripping/Index', [
            'schedules' => $schedules,
            'upcomingTrips' => $upcomingTrips,
            'pastTrips' => $pastTrips,
            'cancelledTrips' => $cancelledTrips,
            'pendingTrips' => $pendingTrips,
        ]);
    }

    public function update(Request $request, $id, $action)
    {
        $status = ucfirst(strtolower($action)); // e.g. "accepted" → "Accepted"

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
