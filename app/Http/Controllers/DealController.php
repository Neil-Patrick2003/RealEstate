<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\PropertyListing;
use App\Notifications\DealResponse;
use App\Notifications\NewDeal;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function index(){

        $deals = Deal::with([
            'property_listing.property:id,title,price,image_url,address,property_type,sub_type,lot_area,floor_area',
            'property_listing.agent:id,name,photo_url,email,contact_number',
            'property_listing.seller:id,name',
            'feedback'
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

        $deal = Deal::create([
            'property_listing_id' => $propertyListing->id,
            'amount' => $request->amount,
            'buyer_id' => auth()->id(),
            'status' => 'Pending',
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        $agents = $propertyListing->load('agents')->agents;



        $property = $propertyListing->property;

        foreach ($agents as $agent) {
            $agent->notify(new NewDeal([
                'buyer_name' => auth()->user()->name,
                'amount' => $deal->amount,
                'property_title' => $property->title,
            ]));
        }


        return redirect()->back()->with('success', 'Deal created successfully');
    }

    public function update(Request $request, PropertyListing $propertyListing, Deal $deal)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1|max:9999999.99',
        ]);

        $deal->update([
            'amount' => $request->amount,
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

        $agents = $propertyListing->load('agents')->agents;

        $property = $deal->property_listing->property;

        foreach ($agents as $agent) {
            $agent->notify(new NewDeal([
                'buyer_name' => auth()->user()->name,
                'amount' => $deal->amount,
                'property_title' => $property->title,
            ]));
        }


        return redirect()->back()->with('success', 'Deal updated successfully');
    }


    public function handleUpdate(Request $request, $id, $status)
    {
        $deal = Deal::find($id);
        if (!$deal) {
            return redirect()->back()->with('error', 'Deal not found');
        }

        $deal->update(['status' => $status]);

        $propertyListing = PropertyListing::find($deal->property_listing_id);
        if (!$propertyListing) {
            return redirect()->back()->with('error', 'Property listing not found');
        }

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
        } elseif (in_array($status, ['Rejected', 'Cancelled'])) {
            foreach ($inquiries as $inquiry) {
                if ($inquiry->buyer_id === $deal->buyer_id) {
                    $inquiry->update(['status' => 'Closed No Deal']);
                }
            }
        } elseif ($status === 'Sold') {
            foreach ($inquiries as $inquiry) {
                if ($inquiry->buyer_id === $deal->buyer_id) {
                    $inquiry->update(['status' => 'Closed with Deal']);
                }
            }

            $propertyListing->update([
                'status' => 'Sold',
                'sold_at' => now()
            ]);

            $propertyListing->property->update(['status' => 'Sold']);

            return redirect()->back()->with('success', 'Property officially sold!');
        }

        $buyer = $deal->buyer;
        $agent = $propertyListing->agent;

        // ✅ Only notify buyer if the last update was NOT made by the buyer
        if ($deal->amount_last_updated_by === $buyer->id) {
            $buyer->notify(new DealResponse([
                'name' => $buyer->name,
                'property_title' => $propertyListing->property->title,
                'status' => $status,
            ]));
        }
        else{
            $agent->notify(new DealResponse([
                'name' => $buyer->name,
                'property_title' => $propertyListing->property->title,
                'status' => $status,
            ]));
        }


        return redirect()->back()->with('success', "Deal {$status} successfully.");
    }



}
