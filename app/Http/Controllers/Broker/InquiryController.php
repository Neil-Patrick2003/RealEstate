<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request){

        $inquiries = Inquiry::with('seller', 'buyer', 'property')
            ->where('seller_id', auth()->id())
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                if (strtolower($request->status) === 'cancelled') {
                    // Match all statuses that start with "Cancelled"
                    $q->where('status', 'LIKE', 'Cancelled%');
                } else {
                    $q->where('status', $request->status);
                }
            })
            ->when($request->filled('type') && $request->type === 'buyer', function ($q) {
                $q->whereNotNull('buyer_id');
            })
            ->orderByDesc('created_at')
            ->paginate($request->get('items_per_page', 10));

            $inquiryCount = Inquiry::where('seller_id', auth()->id())->count();

            $rejectedCount = Inquiry::where('seller_id', auth()->id())->where('status', 'Rejected')->count();

            $acceptedCount = Inquiry::where('seller_id', auth()->id())->where('status', 'Accepted')->count();

            $pendingCount = Inquiry::where('seller_id', auth()->id())->where('status', 'Pending')->count();
            $cancelledCount = Inquiry::where('seller_id', auth()->id())->where('status', 'LIKE', 'Cancelled%')->count();


        return Inertia::render('Broker/Inquiry/Index', [
            'inquiries' => $inquiries,
            'inquiryCount' => $inquiryCount,
            'rejectedCount' => $rejectedCount,
            'acceptedCount' => $acceptedCount,
            'pendingCount' => $pendingCount,
            'cancelledCount' => $cancelledCount,
        ]);
    }

    public function update(Inquiry $inquiry, $action)
    {
        $validActions = [
            'accept' => 'accepted',
            'reject' => 'rejected',
        ];

        if (!array_key_exists($action, $validActions)) {
            abort(400, 'Invalid action.');
        }

        $inquiry->update(['status' => $validActions[$action]]);

        return redirect()->back()->with('success', 'Inquiry status updated successfully.');
    }

    public function show(Inquiry $inquiry){


        $inquiry = $inquiry->load( 'buyer', 'property');


        return Inertia::render('Broker/Inquiry/Show', [
            'inquiry' => $inquiry,
        ]);
    }

}
