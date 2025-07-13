<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {

        $sellerId = auth()->id();

        $allCount = Inquiry::where('seller_id', $sellerId)->count();
        $acceptedCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Accepted')->count();
        $pendingCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Pending')->count();
        $rejectedCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Rejected')->count();
        $cancelledCount = Inquiry::where('seller_id', $sellerId)->where('status', 'Cancelled')->count();

        $inquiries = Inquiry::where('seller_id', $sellerId)
            ->with('property', 'agent', 'messages')
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('agent', function ($q2) use ($request) {
                    $q2->where('name', 'like', '%' . $request->search . '%');
                });
            })
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                $q->status($request->status);
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('Seller/Inquiries/Inquiries', [
            'inquiries' => $inquiries,
            'allCount' => $allCount,
            'acceptedCount' => $acceptedCount,
            'pendingCount' => $pendingCount,
            'rejectedCount' => $rejectedCount,
            'cancelledCount' => $cancelledCount,
        ]);




//        $query = Property::where('seller_id', Auth::id())
//            ->whereHas('inquiries')
//            ->with(['inquiries.agent']);
//
//        if ($request->filled('search')) {
//            $query->where(function ($q) use ($request) {
//                $q->where('title', 'like', "%{$request->search}%")
//                    ->orWhere('address', 'like', "%{$request->search}%");
//            });
//        }
//
//        if ($request->filled('property_type')) {
//            $query->where('property_type', $request->property_type);
//        }
//
//        if ($request->filled('status')) {
//            $query->whereHas('inquiries', function ($q) use ($request) {
//                $q->where('status', $request->status);
//            });
//        }
//
//        $properties = $query->latest()
//            ->paginate($request->items_per_page ?? 10)
//            ->withQueryString();
//
//
//        return Inertia::render('Seller/Inquiries/Inquiries', [
//            'properties' => $properties,
//            'itemsPerPage' => $request->items_per_page ?? 10,
//            'search' => $request->search,
//            'filters' => [
//                'status' => $request->status,
//                'property_type' => $request->property_type,
//            ],
//            'allCount' => Property::where('seller_id', Auth::id())->whereHas('inquiries')->count(),
//            'acceptedCount' => Property::where('seller_id', Auth::id())->whereHas('inquiries', fn($q) => $q->where('status', 'Accepted'))->count(),
//            'pendingCount' => Property::where('seller_id', Auth::id())->whereHas('inquiries', fn($q) => $q->where('status', 'Pending'))->count(),
//            'rejectedCount' => Property::where('seller_id', Auth::id())->whereHas('inquiries', fn($q) => $q->where('status', 'Rejected'))->count(),
//        ]);
    }




    public function updateStatus(Request $request, Inquiry $inquiry, $action)
    {
        if (!in_array($action, ['accept', 'reject'])) {
            abort(400, 'Invalid action');
        }

        $status = $action === 'accept' ? 'Accepted' : 'Rejected';
        $property = $inquiry->property;


        // If "accept"
        if ($status === 'Accepted') {
            // If property does NOT allow multiple agents
            if (!$property->allow_multi_agents) {
                // Reject all other pending inquiries for the same property
                Inquiry::where('property_id', $property->id)
                    ->where('id', '!=', $inquiry->id)
                    ->where('status', 'Pending')
                    ->update(['status' => 'rejected']);
            }

            // Update property status to Assigned (if not already)
            $property->update(['status' => 'Assigned']);

            // Create a property listing for the accepted agent
            PropertyListing::create([
                'agent_id'    => $inquiry->agent_id,
                'property_id' => $inquiry->property_id,
                'seller_id'   => $inquiry->seller_id,
                'status'      => 'Assigned',
            ]);
        }

        // Update inquiry status (accept or reject)
        $inquiry->update(['status' => $status]);

        return back()->with('success', "Inquiry successfully {$status}.");
    }

}
