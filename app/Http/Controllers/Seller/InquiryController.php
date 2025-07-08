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

        $properties = Property::where('seller_id', Auth::id())
            ->whereHas('inquiries')
            ->with('inquiries.agent')
            ->latest()
            ->paginate($request->items_per_page, ['*'], 'page', $request->input('page', 1));

        return Inertia::render('Seller/Inquiries/Inquiries', [
            'properties' => $properties,
        ]);
    }

    public function updateStatus(Request $request, Inquiry $inquiry, $action)
    {
        if (!in_array($action, ['accept', 'reject'])) {
            abort(400, 'Invalid action');
        }

        $status = $action === 'accept' ? 'accepted' : 'rejected';
        $property = $inquiry->property;
        

        // If action is "accept"
        if ($status === 'accepted') {
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
