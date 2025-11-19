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

        // Date range filters with validation
        $from = $request->input('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->copy()->subDays(29)->startOfDay();

        $to = $request->input('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfDay();

        // Validate date range
        if ($from->gt($to)) {
            $from = $to->copy()->subDays(29)->startOfDay();
        }

        // All listing IDs assigned to this agent via pivot table
        $assignedListingIds = DB::table('property_listing_agents')
            ->where('agent_id', $agentId)
            ->pluck('property_listing_id');

        // --- ENHANCED KPIs ---
        $listings_total = PropertyListing::whereIn('id', $assignedListingIds)->count();
        $listings_published = PropertyListing::whereIn('id', $assignedListingIds)
            ->where('status', 'Published')
            ->count();
        $listings_draft = PropertyListing::whereIn('id', $assignedListingIds)
            ->where('status', 'Draft')
            ->count();

        // Inquiry statistics
        $inquiries_total = Inquiry::where('agent_id', $agentId)->count();
        $inquiries_pending = Inquiry::where('agent_id', $agentId)
            ->where('status', 'Pending')
            ->count();
        $inquiries_accepted = Inquiry::where('agent_id', $agentId)
            ->where('status', 'Accepted')
            ->count();
        $inquiries_converted = Inquiry::where('agent_id', $agentId)
            ->where('status', 'Closed')
            ->count();

        // Performance metrics (last 30 days vs previous 30 days)
        $currentPeriodStart = now()->subDays(30);
        $previousPeriodStart = now()->subDays(60);

        $currentInquiries = Inquiry::where('agent_id', $agentId)
            ->whereBetween('created_at', [$currentPeriodStart, now()])
            ->count();

        $previousInquiries = Inquiry::where('agent_id', $agentId)
            ->whereBetween('created_at', [$previousPeriodStart, $currentPeriodStart])
            ->count();

        $inquiryGrowth = $previousInquiries > 0
            ? (($currentInquiries - $previousInquiries) / $previousInquiries) * 100
            : ($currentInquiries > 0 ? 100 : 0);

        // Tripping statistics
        $total_trippings = PropertyTripping::where('agent_id', $agentId)->count();
        $upcoming_trippings_count = PropertyTripping::where('agent_id', $agentId)
            ->where(function ($q) {
                $q->when(DB::getSchemaBuilder()->hasColumn('property_trippings', 'visit_date'), function ($qq) {
                    $qq->whereDate('visit_date', '>=', now()->toDateString());
                }, function ($qq) {
                    $qq->whereDate('visit_date', '>=', now()->toDateString());
                });
            })
            ->count();

        // --- Upcoming trippings ---
        $upcoming_trippings = PropertyTripping::with(['property', 'buyer'])
            ->where('agent_id', $agentId)
            ->where(function ($q) {
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
            ->limit(8) // Increased limit for better overview
            ->get();

        // Recent/Queues
        $recent_inquiries = Inquiry::with(['buyer', 'property'])
            ->where('agent_id', $agentId)
            ->latest('created_at')
            ->limit(6)
            ->get();

        $recent_listings = PropertyListing::with('property')
            ->whereIn('id', $assignedListingIds)
            ->latest('created_at')
            ->limit(6)
            ->get();

        // --- ENHANCED Charts ---

        // 1) Inquiries by status (current month)
        $inquiriesByStatus = Inquiry::where('agent_id', $agentId)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->get();

        // 2) Inquiries by day within selected date range
        $inquiriesByDay = Inquiry::where('agent_id', $agentId)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw("DATE(created_at) as d, COUNT(*) as cnt")
            ->groupBy('d')
            ->orderBy('d')
            ->get();

        // 3) NEW: Performance trend (monthly for last 6 months)
        $monthlyPerformance = Inquiry::where('agent_id', $agentId)
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw("
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as total_inquiries,
            SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as converted_inquiries
        ")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // 4) NEW: Listing performance
        $topPerformingListings = PropertyListing::whereIn('id', $assignedListingIds)
            ->addSelect([
                'inquiry_count' => Inquiry::selectRaw('COUNT(*)')
                    ->whereColumn('inquiries.property_id', 'property_listings.property_id')
                    ->where('created_at', '>=', now()->subDays(30))
            ])
            ->orderByDesc('inquiry_count')
            ->limit(5)
            ->get(['id', 'title']);


        // Feedback and ratings
        $feedback = Feedback::where('agent_id', $agentId)
            ->with('characteristics')
            ->latest()
            ->limit(5)
            ->get();

        $avgRatings = Auth::user()->averageFeedback;

        // --- Pack response ---
        return inertia('Agent/AgentDashboard', [
            'filters' => [
                'date_from' => optional($from)->toDateString(),
                'date_to'   => optional($to)->toDateString(),
            ],
            'kpi' => [
                'listings'  => [
                    'total' => $listings_total,
                    'published' => $listings_published,
                    'draft' => $listings_draft
                ],
                'inquiries' => [
                    'total' => $inquiries_total,
                    'pending' => $inquiries_pending,
                    'accepted' => $inquiries_accepted,
                    'converted' => $inquiries_converted,
                    'growth' => round($inquiryGrowth, 1)
                ],
                'trippings' => [
                    'total' => $total_trippings,
                    'upcoming' => $upcoming_trippings_count
                ],
                'performance' => [
                    'conversion_rate' => $inquiries_total > 0 ? round(($inquiries_converted / $inquiries_total) * 100, 1) : 0,
                    'response_rate' => $inquiries_total > 0 ? round((($inquiries_total - $inquiries_pending) / $inquiries_total) * 100, 1) : 0
                ]
            ],
            'charts' => [
                'inquiriesByStatus' => $inquiriesByStatus,
                'inquiriesByDay'    => $inquiriesByDay,
                'monthlyPerformance' => $monthlyPerformance,
                'topListings' => $topPerformingListings
            ],
            'queues' => [
                'recentInquiries'   => $recent_inquiries,
                'upcomingTrippings' => $upcoming_trippings,
                'recentListings'    => $recent_listings,
            ],
            'feedback' => [
                'recent' => $feedback,
                'average' => $avgRatings,
                'total_reviews' => $feedback->count()
            ]
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
        $agent = $agent->with('listing.property', 'feedbackAsReceiver.characteristics', 'property_listings.property')->find($agent->id);


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
