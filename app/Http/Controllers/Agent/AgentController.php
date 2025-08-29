<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\PropertyTripping;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class AgentController extends Controller
{

    public function index()
    {
        $user = auth()->user();

        $properties = PropertyListing::with('agents')
            ->whereHas('agents', function ($query) use ($user) {
                $query->where('agent_id', $user->id);
            })
            ->latest()
            ->get();
        $totalListing = $properties->count();

        $inquiries = Inquiry::where('agent_id', $user->id)->get();

        // Group and format inquiries for chart
        $grouped = [];

        foreach ($inquiries as $inquiry) {
            $date = Carbon::parse($inquiry->created_at)->format('Y-m-d');

            if (!isset($grouped[$date])) {
                $grouped[$date] = [
                    'Closed with Deal' => 0,
                    'Closed No Deal' => 0,
                    'Accepted' => 0,
                ];
            }

            if ($inquiry->status === 'Closed with Deal') {
                $grouped[$date]['Closed with Deal']++;
            } elseif ($inquiry->status === 'Closed No Deal') {
                $grouped[$date]['Closed No Deal']++;
            } elseif ($inquiry->status === 'Accepted') {
                $grouped[$date]['Accepted']++;
            }
        }

        ksort($grouped);

        $categories = [];
        $closedWithDealData = [];
        $closedNoDealData = [];
        $acceptedData = [];

        foreach ($grouped as $date => $counts) {
            $categories[] = $date;
            $closedWithDealData[] = $counts['Closed with Deal'];
            $closedNoDealData[] = $counts['Closed No Deal'];
            $acceptedData[] = $counts['Accepted'];
        }

        $chartData = [
            'categories' => $categories,
            'series' => [
                [
                    'name' => 'Closed with Deal',
                    'data' => $closedWithDealData,
                ],
                [
                    'name' => 'Closed No Deal',
                    'data' => $closedNoDealData,
                ],
                [
                    'name' => 'Accepted',
                    'data' => $acceptedData,
                ],
            ],
        ];


        $incoming_tripping = PropertyTripping::where(
            'visit_date', '=', now()
        )
        ->count();


        $recent_inquiries = Inquiry::with('property', 'messages', 'buyer' )
            ->where('agent_id', auth()->id())
            ->where('status', 'Pending')
            ->whereNotNull('buyer_id')
            ->latest()
            ->take(10)
            ->get();





        $feedbacks = Feedback::with('sender')
        ->where('agent_id', auth()->id())
            ->latest()
            ->take(5)
            ->get();






        return Inertia::render('Agent/AgentDashboard', [
            'properties' => $properties,
            'totalListing' => $totalListing,
            'inquiries' => $inquiries,
            'chartData' => $chartData,
            'incoming_tripping' => $incoming_tripping,
            'recent_inquiries' => $recent_inquiries,
            'feedbacks' => $feedbacks
        ]);
    }


    public function loadAgents() {
        $agents = User::where('role', 'agent')->select('id', 'name', 'email')->get();

        return Inertia::render('Seller/ListProperty', [
            'agents' => $agents
        ]);

    }

    public function feedback()
    {
        $feedbacks = Feedback::with('characteristics', 'sender')
            ->latest()
            ->get();



        return Inertia::render('Agent/Feedback/Feedback', [
            'feedbacks' => $feedbacks,
        ]);
    }

    public function show(User $agent)
    {
        $agent = $agent->with('listing.property', 'feedbackAsReceiver.characteristics')->find($agent->id);

        return Inertia::render('Agent/AgentProfile', [
            'agent' => $agent,
        ]);
    }


}
