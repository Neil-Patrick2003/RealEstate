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
        $from = $request->input('date_from') ? Carbon::parse($request->input('date_from'))->startOfDay() : now()->copy()->subDays(29)->startOfDay();
        $to   = $request->input('date_to')   ? Carbon::parse($request->input('date_to'))->endOfDay()   : now()->endOfDay();

        // All listing IDs assigned to this agent via pivot table
        // (If you have an Eloquent relation, feel free to swap!)
        $assignedListingIds = DB::table('property_listing_agents')
            ->where('agent_id', $agentId)
            ->pluck('property_listing_id');

        // --- KPIs ---
        $listings_total = PropertyListing::whereIn('id', $assignedListingIds)->count();
        $listings_published = PropertyListing::whereIn('id', $assignedListingIds)->where('status', 'Published')->count();

        // Inquiries are tied directly to agent_id in your schema
        $inquiries_total = Inquiry::where('agent_id', $agentId)->count();
        $inquiries_pending = Inquiry::where('agent_id', $agentId)->where('status', 'Pending')->count();

        // Deals are NOT tied directly to agent_id in your schema; join via assigned listings
        $dealsQuery = Deal::with(['property_listing.property', 'buyer'])
            ->whereIn('property_listing_id', $assignedListingIds);

        $deals_total = (clone $dealsQuery)->count();
        $deals_pending = (clone $dealsQuery)->whereIn('status', ['Pending', 'Accepted'])->count();
        $deals_closed  = (clone $dealsQuery)->whereIn('status', ['Sold', 'Closed'])->count();

        // Pipeline = sum of amounts for open/pipeline statuses
        $pipeline_value = (clone $dealsQuery)->whereIn('status', ['Pending', 'Accepted'])->sum('amount');
        // Closed value = sum of amounts for closed statuses
        $closed_value   = (clone $dealsQuery)->whereIn('status', ['Sold', 'Closed'])->sum('amount');

        // Upcoming trippings (choose ONE of these depending on your schema):
        //  A) If PropertyTripping has agent_id:
        $upcoming_trippings = PropertyTripping::with(['property', 'buyer'])
            ->where('agent_id', $agentId)
            ->where(function($q) {
                // Handle either (schedule_at) or (start_date + start_time)
                $q->when(DB::getSchemaBuilder()->hasColumn('property_trippings', 'visit_date'), function($qq) {
                    $qq->where('visit_date', '>=', now());
                }, function($qq) {
                    $qq->whereDate('visit_date', '>=', now()->toDateString());
                });
            })
            ->orderByRaw(DB::getSchemaBuilder()->hasColumn('property_trippings', 'visit_date')
                ? 'visit_date asc'
                : 'visit_date asc, visit_time asc'
            )
            ->limit(5)
            ->get();

        //  B) If you don't have agent_id on PropertyTripping, tie via Inquiry->agent_id:
        // $upcoming_trippings = PropertyTripping::with(['property', 'buyer', 'inquiry'])
        //     ->whereHas('inquiry', fn($q) => $q->where('agent_id', $agentId))
        //     ->whereDate('start_date', '>=', now()->toDateString())
        //     ->orderBy('start_date')
        //     ->orderBy('start_time')
        //     ->limit(5)
        //     ->get();

        // Recent/Queues
        $recent_inquiries = Inquiry::with(['buyer', 'property'])
            ->where('agent_id', $agentId)
            ->latest('created_at')
            ->limit(5)->get();

        $pending_deals = (clone $dealsQuery)
            ->whereIn('status', ['Pending', 'Accepted'])
            ->latest('updated_at')
            ->limit(5)->get();

        $recent_listings = PropertyListing::with('property')
            ->whereIn('id', $assignedListingIds)
            ->latest('created_at')
            ->limit(5)->get();

        // --- Charts ---
        // Deals by month (last 12 months) for this agent
        $dealsByMonth = (clone $dealsQuery)
            ->whereBetween('created_at', [now()->copy()->subMonths(11)->startOfMonth(), now()->endOfMonth()])
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, SUM(amount) as total")
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Inquiries by status (current month)
        $inquiriesThisMonth = Inquiry::where('agent_id', $agentId)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->get();

        // Pack response
        return inertia('Agent/AgentDashboard', [
            'filters' => [
                'date_from' => optional($from)->toDateString(),
                'date_to'   => optional($to)->toDateString(),
            ],
            'kpi' => [
                'listings' => ['total' => $listings_total, 'published' => $listings_published],
                'inquiries'=> ['total' => $inquiries_total, 'pending' => $inquiries_pending],
                'deals'    => ['total' => $deals_total, 'pending' => $deals_pending, 'closed' => $deals_closed, 'pipeline_value' => (float)$pipeline_value, 'closed_value' => (float)$closed_value],
            ],
            'charts' => [
                'dealsByMonth' => $dealsByMonth,
                'inquiriesThisMonth' => $inquiriesThisMonth,
            ],
            'queues' => [
                'recentInquiries' => $recent_inquiries,
                'pendingDeals'    => $pending_deals,
                'upcomingTrippings' => $upcoming_trippings,
                'recentListings'  => $recent_listings,
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
