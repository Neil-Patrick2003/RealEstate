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
        $inquiries = Inquiry::with(['agent:id,name,email', 'property:id,title,image_url,property_type,sub_type'])
        ->where('seller_id', Auth::id())
            ->when($request->filled('status') && $request->status !== 'All', function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('items_per_page', 10));

        $inquiryCount = Inquiry::where('seller_id', auth()->id())->count();

        $rejectedCount = Inquiry::where('seller_id', auth()->id())
            ->where('status', 'rejected')
            ->count();

        $acceptedCount = Inquiry::where('seller_id', auth()->id())
            ->where('status', 'accepted')
            ->count();

        $pendingCount = Inquiry::where('seller_id', auth()->id())
            ->where('status', 'pending')
            ->count();

        $cancelledCount = Inquiry::where('seller_id', auth()->id())
            ->where('status', 'cancelled')
            ->count();



        return Inertia::render('Seller/Inquiries/Inquiries', [
            'inquiries' => $inquiries,
            'inquiryCount' => $inquiryCount,
            'rejectedCount' => $rejectedCount,
            'acceptedCount' => $acceptedCount,
            'pendingCount' => $pendingCount,
            'cancelledCount' => $cancelledCount,
        ]);
    }

    public function updateStatus(Request $request, Inquiry $inquiry, $action)
    {
        // Optional: Authorization (only if seller must own the property)
        if ($inquiry->property->seller_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        if (!in_array($action, ['accept', 'reject'])) {
            abort(400, 'Invalid action');
        }

        $status = $action === 'accept' ? 'accepted' : 'rejected';


        $inquiry->update(['status' => $status]);

        $newStatus = $status === 'accepted' ? 'To Published' : 'Rejected';

        $inquiry->property->update(['status' => $newStatus]);

        PropertyListing::create([
            'agent_id' => $inquiry->agent_id,
            'property_id' => $inquiry->property_id,
            'status' => 'For Published',
        ]);

        return back()->with('success', "Inquiry successfully {$status}.");
    }
}
