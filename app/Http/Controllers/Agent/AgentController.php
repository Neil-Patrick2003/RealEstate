<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class AgentController extends Controller
{

    public function index()
    {
        $user = auth()->user();

        $properties = PropertyListing::where('agent_id', $user->id)->get();
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


        return Inertia::render('Agent/AgentDashboard', [
            'properties' => $properties,
            'totalListing' => $totalListing,
            'inquiries' => $inquiries,
            'chartData' => $chartData, // Pass formatted data here
        ]);
    }


    public function loadAgents() {
        $agents = User::where('role', 'agent')->select('id', 'name', 'email')->get();

        return Inertia::render('Seller/ListProperty', [
            'agents' => $agents
        ]);


    }


}
