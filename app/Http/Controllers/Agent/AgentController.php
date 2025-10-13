<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Feedback;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\PropertyTripping;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AgentController extends Controller
{

    public function index(Request $request)
    {
        $agentId = auth()->id();

        // Date range filters (optional)
        $from = $request->input('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->copy()->subDays(29)->startOfDay();

        $to = $request->input('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfDay();

        // All listing IDs assigned to this agent via pivot table
        $assignedListingIds = DB::table('property_listing_agents')
            ->where('agent_id', $agentId)
            ->pluck('property_listing_id');

        // --- KPIs (no deals) ---
        $listings_total = PropertyListing::whereIn('id', $assignedListingIds)->count();
        $listings_published = PropertyListing::whereIn('id', $assignedListingIds)
            ->where('status', 'Published')
            ->count();

        $inquiries_total = Inquiry::where('agent_id', $agentId)->count();
        $inquiries_pending = Inquiry::where('agent_id', $agentId)
            ->where('status', 'Pending')
            ->count();

        // --- Upcoming trippings ---
        $upcoming_trippings = PropertyTripping::with(['property', 'buyer'])
            ->where('agent_id', $agentId)
            ->where(function ($q) {
                // Handle either (visit_date) or (visit_date + visit_time)
                $q->when(DB::getSchemaBuilder()->hasColumn('property_trippings', 'visit_date'), function ($qq) {
                    $qq->whereDate('visit_date', '>=', now()->toDateString());
                }, function ($qq) {
                    $qq->whereDate('visit_date', '>=', now()->toDateString());
                });
            })
            ->orderByRaw(
                DB::getSchemaBuilder()->hasColumn('property_trippings', 'visit_time')
                    ? 'visit_date asc, visit_time asc'
                    : 'visit_date asc'
            )
            ->limit(5)
            ->get();

        // Recent/Queues (no deals queue)
        $recent_inquiries = Inquiry::with(['buyer', 'property'])
            ->where('agent_id', $agentId)
            ->latest('created_at')
            ->limit(5)
            ->get();

        $recent_listings = PropertyListing::with('property')
            ->whereIn('id', $assignedListingIds)
            ->latest('created_at')
            ->limit(5)
            ->get();

        // --- Charts (no deals charts) ---
        // 1) Inquiries by status (current month)
        $inquiriesByStatus = Inquiry::where('agent_id', $agentId)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->get();

        // 2) Inquiries by day within selected date range (line chart-ready)
        $inquiriesByDay = Inquiry::where('agent_id', $agentId)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw("DATE(created_at) as d, COUNT(*) as cnt")
            ->groupBy('d')
            ->orderBy('d')
            ->get();

        // --- Pack response (no deals keys anywhere) ---
        return inertia('Agent/AgentDashboard', [
            'filters' => [
                'date_from' => optional($from)->toDateString(),
                'date_to'   => optional($to)->toDateString(),
            ],
            'kpi' => [
                'listings'  => ['total' => $listings_total, 'published' => $listings_published],
                'inquiries' => ['total' => $inquiries_total, 'pending' => $inquiries_pending],
            ],
            'charts' => [
                'inquiriesByStatus' => $inquiriesByStatus,
                'inquiriesByDay'    => $inquiriesByDay,
            ],
            'queues' => [
                'recentInquiries'   => $recent_inquiries,
                'upcomingTrippings' => $upcoming_trippings,
                'recentListings'    => $recent_listings,
            ],
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

    public function calendar()
    {
        $events = PropertyTripping::with('property')
            ->where('agent_id', Auth::user()->id)
            ->get();

        return Inertia::render('Agent/Tripping/Calendar');

//        dd($events);
    }


}
