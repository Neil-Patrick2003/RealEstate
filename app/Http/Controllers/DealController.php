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
            'property_listing.property.project',
            'property_listing.property:id,title,price,image_url,address,property_type,sub_type,lot_area,floor_area,seller_id',
            'property_listing.agents:id,name,photo_url,email,contact_number',
            'property_listing.property.seller:id,name',
            'feedback'
        ])
            ->where('buyer_id', auth()->id())
            ->latest()
            ->get();

        return inertia('Buyer/Deal/Index', [
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
            'amount' => 'required|numeric|min:1|max:9999999999.99',
        ]);

        $deal->update([
            'amount' => $request->amount,
            'amount_last_updated_at' => now(),
            'amount_last_updated_by' => auth()->id(),
        ]);

//        $agents = $propertyListing->load('agents')->agents;
        $propertyListing->load(['agents', 'broker', 'property']);


        $property = $deal->property_listing->property;

        // Notify all agents (if any)
        if ($propertyListing->agents->isNotEmpty()) {
            foreach ($propertyListing->agents as $agent) {
                $agent->notify(new NewDeal([
                    'buyer_name'     => auth()->user()->name,
                    'amount'         => $deal->amount,
                    'property_title' => $property->title,
                ]));
            }
        }

        // Notify broker (if any)
        if ($propertyListing->broker) {
            $propertyListing->broker->notify(new NewDeal([
                'buyer_name'     => auth()->user()->name,
                'amount'         => $deal->amount,
                'property_title' => $property->title,
            ]));
        }


        return redirect()->back()->with('success', 'Deal updated successfully');
    }


    public function handleUpdate(Request $request, $id, $statusFromRoute = null)
    {
        // 1) Normalize incoming status (from route or request)
        $rawStatus = strtolower(trim($statusFromRoute ?? $request->input('status', '')));

        $statusMap = [
            'accept'    => 'Accepted',
            'accepted'  => 'Accepted',

            'decline'   => 'Declined',
            'declined'  => 'Declined',
            'reject'    => 'Declined',
            'rejected'  => 'Declined',

            'cancel'    => 'Cancelled',
            'cancelled' => 'Cancelled',

            'reserved'  => 'Reserved',
            'sold'      => 'Sold',
        ];

        if (! isset($statusMap[$rawStatus])) {
            return redirect()
                ->back()
                ->with('error', 'Invalid status value.');
        }

        $normalizedStatus = $statusMap[$rawStatus];

        // 2) Load main deal
        $deal = Deal::with('buyer')->find($id);

        if (! $deal) {
            return redirect()->back()->with('error', 'Deal not found');
        }

        // 3) Load listing + relations
        $propertyListing = PropertyListing::with(['property', 'agents', 'broker'])
            ->find($deal->property_listing_id);

        if (! $propertyListing || ! $propertyListing->property) {
            return redirect()->back()->with('error', 'Property listing not found');
        }

        // 4) Related inquiries and deals for this property
        $inquiries = Inquiry::where('property_id', $propertyListing->property_id)
            ->whereNotNull('buyer_id')
            ->get();

        $relatedDeals = Deal::where('property_listing_id', $deal->property_listing_id)->get();

        // 5) Update main deal
        $deal->update([
            'status' => $normalizedStatus,
            'notes'  => $request->input('rejection_reason'), // can be null
        ]);

        // 6) Business rules per status
        switch ($normalizedStatus) {
            case 'Accepted':
                // Winning buyer: mark all his deals as Accepted;
                // Other buyers' deals: Declined + note.
                foreach ($relatedDeals as $relatedDeal) {
                    if ($relatedDeal->buyer_id === $deal->buyer_id) {
                        $relatedDeal->update([
                            'status' => 'Accepted',
                        ]);
                    } else {
                        $relatedDeal->update([
                            'status' => 'Declined',
                            'notes'  => 'Property already secured a deal with another buyer.',
                        ]);
                    }
                }

                // Inquiries: winner → Under Negotiation; others → Declined + note
                foreach ($inquiries as $inquiry) {
                    if ($inquiry->buyer_id === $deal->buyer_id) {
                        $inquiry->update(['status' => 'Under Negotiation']);
                    } else {
                        $inquiry->update([
                            'status' => 'Declined',
                            'notes'  => 'The property is already under negotiation with another buyer.',
                        ]);
                    }
                }
                break;

            case 'Declined':
            case 'Cancelled':
                // Only the current buyer’s inquiry → Closed No Deal
                foreach ($inquiries as $inquiry) {
                    if ($inquiry->buyer_id === $deal->buyer_id) {
                        $inquiry->update(['status' => 'Closed No Deal']);
                    }
                }
                break;

            case 'Sold':
                // Close all inquiries properly
                foreach ($inquiries as $inquiry) {
                    if ($inquiry->buyer_id === $deal->buyer_id) {
                        $inquiry->update(['status' => 'Closed with Deal']);
                    } else {
                        $inquiry->update(['status' => 'Closed No Deal']);
                    }
                }

                // Mark listing + property as sold
                $propertyListing->update([
                    'status'  => 'Sold',
                    'sold_at' => now(),
                ]);

                $propertyListing->property->update(['status' => 'Sold']);

                // No break; we’ll still send notifications + final success message below
                break;

            case 'Reserved':
                // (Optional) you can add special logic for Reserved here
                break;
        }

        // 7) Notifications
        $buyer    = $deal->buyer;
        $property = $propertyListing->property;
        $currentUserId = auth()->id();

        if ($buyer) {
            if ($currentUserId !== $buyer->id) {
                // ➜ Update done by agent/broker/admin: notify buyer
                $buyer->notify(new DealResponse([
                    'name'           => $buyer->name,
                    'property_title' => $property->title,
                    'status'         => $normalizedStatus,
                ]));
            } else {
                // ➜ Update done by buyer: notify agents + broker
                if ($propertyListing->agents->isNotEmpty()) {
                    foreach ($propertyListing->agents as $agent) {
                        $agent->notify(new NewDeal([
                            'buyer_name'     => $buyer->name,
                            'amount'         => $deal->amount,
                            'property_title' => $property->title,
                        ]));
                    }
                }

                if ($propertyListing->broker) {
                    $propertyListing->broker->notify(new NewDeal([
                        'buyer_name'     => $buyer->name,
                        'amount'         => $deal->amount,
                        'property_title' => $property->title,
                    ]));
                }
            }
        }

        // 8) Final response message
        $message = $normalizedStatus === 'Sold'
            ? 'Property officially sold!'
            : "Deal {$normalizedStatus} successfully.";

        return redirect()->back()->with('success', $message);
    }




}
