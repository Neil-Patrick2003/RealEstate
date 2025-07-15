<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\PropertyListing;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function index(){

        $deals = Deal::with([
            'property_listing.property:id,title,price,image_url,address',
            'property_listing.agent:id,name',
            'property_listing.seller:id,name',
        ])
            ->where('buyer_id', auth()->id())
            ->latest()
            ->get();




        return inertia('Buyer/Deal/Deal', [
            'deals' => $deals,
        ]);
    }

    public function store(Request $request, PropertyListing $propertyListing)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        Deal::create([
            'property_listing_id' => $propertyListing->id,
            'amount' => $request->amount,
            'buyer_id' => auth()->id(),
            'status' => 'Pending',
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Deal created successfully');
    }

    public function update(Request $request, PropertyListing $propertyListing, Deal $deal)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:999999.99',
        ]);

        $deal->update([
            'amount' => $request->amount,
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Deal updated successfully');
    }


    public function handleUpdate(Request $request, $id, $status)
    {
        // Find deal
        $deal = Deal::find($id);
        if (!$deal) {
            return redirect()->back()->with('error', 'Deal not found');
        }

        // Update deal status
        $deal->update(['status' => $status]);

        // Find property listing
        $propertyListing = PropertyListing::find($deal->property_listing_id);
        if (!$propertyListing) {
            return redirect()->back()->with('error', 'Property listing not found');
        }

        // Get inquiries related to the property
        $inquiries = Inquiry::where('property_id', $propertyListing->property_id)
            ->whereNotNull('buyer_id')
            ->get();

        if ($status === 'Accepted') {
            foreach ($inquiries as $inquiry) {
                if ($inquiry->buyer_id === $deal->buyer_id) {
                    $inquiry->update(['status' => 'Under Negotiation']);
                } else {
                    $inquiry->update(['status' => 'Declined']);
                }
            }

        } elseif ($status === 'Rejected' || $status === 'Cancelled') {
            foreach ($inquiries as $inquiry) {
                if ($inquiry->buyer_id === $deal->buyer_id) {
                    $inquiry->update(['status' => 'Closed No Deal']);
                }
            }

        } elseif ($status === 'Sold') {
            $propertyListing->update(['status' => 'Sold']);
            $propertyListing->property->update(['status' => 'Sold']);

            return redirect()->back()->with('success', 'Property officially sold!');
        }

        return redirect()->back()->with('success', "Deal {$status} successfully.");
    }


}
