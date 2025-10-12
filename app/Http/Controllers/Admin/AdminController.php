<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyListing;
use App\Models\PropertyTripping;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->date_from
            ? Carbon::parse($request->date_from)->startOfDay()
            : now()->subDays(30)->startOfDay();
        $to = $request->date_to
            ? Carbon::parse($request->date_to)->endOfDay()
            : now()->endOfDay();

        // ===== User metrics (adjust role field/values if different) =====
        $total_users   = User::count();
        $brokers_count = User::where('role', 'Broker')->count();
        $agents_count  = User::where('role', 'Agent')->count();
        $buyers_count  = User::where('role', 'Buyer')->count();

        // ===== Listings / Properties =====
        $properties_total     = Property::count();
        $listings_published   = PropertyListing::where('status', 'Published')->count();
        $listings_unpublished = PropertyListing::where('status', 'Unpublished')->count();

        // ===== Inquiries =====
        $inquiries_total   = Inquiry::count();
        $inquiries_pending = Inquiry::where('status', 'Pending')->count();

        // ===== Deals (adjust statuses to match your app) =====
        $deals_total    = Deal::count();
        $deals_pending  = Deal::where('status', 'Pending')->count();
        $deals_closed   = Deal::whereIn('status', ['Sold', 'Closed'])->count();
        $deals_cancelled= Deal::where('status', 'Cancelled')->count();

        // ===== Daily time-series for charts =====
        $daily_listings = Property::whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->map(fn ($r) => ['date' => $r->d, 'value' => (int)$r->c])
            ->values();

        $daily_deals = Deal::whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as d, COUNT(*) as c')
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->map(fn ($r) => ['date' => $r->d, 'value' => (int)$r->c])
            ->values();

        // ===== Top brokers (requires relationships on User model; see note below) =====

        $top_brokers = User::where('role','Broker')
            ->select('users.id','users.name')
            ->selectSub(function (Builder $q) {
                $q->from('property_listings')
                    ->whereColumn('property_listings.broker_id', 'users.id')
                    ->where('status', 'Published')
                    ->selectRaw('COUNT(*)');
            }, 'published_listings_count')
            ->selectSub(function (Builder $q) {
                $q->from('deals')
                    ->join('property_listings', 'property_listings.id', '=', 'deals.property_listing_id')
                    ->whereColumn('property_listings.broker_id', 'users.id')
                    ->whereIn('deals.status', ['Sold','Closed'])
                    ->selectRaw('COUNT(*)');
            }, 'closed_deals_count')
            ->orderByDesc('closed_deals_count')
            ->limit(5)
            ->get();


        // ===== Recent activity =====
        $recent_properties = Property::latest()->limit(5)->get(['id','title','address','image_url','created_at']);
        $recent_users      = User::latest()->limit(5)->get(['id','name','email','role','created_at']);

        // ===== Upcoming trippings (platform-wide) =====
        // You said you have start_date + start_time (no schedule_at)
        // We consider anything later than "now" upcoming:
        $now = now();
        $today = $now->toDateString();
        $time  = $now->format('H:i:s');

        $upcoming_trippings = PropertyTripping::with(['property:id,title,image_url,address', 'buyer:id,name,email'])
            ->where(function ($q) use ($today, $time) {
                $q->whereDate('visit_date', '>', $today)
                    ->orWhere(function ($q2) use ($today, $time) {
                        $q2->whereDate('visit_date', $today)
                            ->whereTime('visit_time', '>=', $time);
                    });
            })
            ->orderBy('visit_date')
            ->orderBy('visit_time')
            ->limit(5)
            ->get(['id','property_id','buyer_id','visit_date','visit_time']);

        return Inertia::render('Admin/Dashboard', [
            'filters' => [
                'date_from' => $from->toDateString(),
                'date_to'   => $to->toDateString(),
            ],

            // Top stats
            'users' => [
                'total' => $total_users,
                'brokers' => $brokers_count,
                'agents' => $agents_count,
                'buyers' => $buyers_count,
            ],
            'listings' => [
                'properties_total' => $properties_total,
                'published' => $listings_published,
                'unpublished' => $listings_unpublished,
            ],
            'inquiries' => [
                'total' => $inquiries_total,
                'pending' => $inquiries_pending,
            ],
            'deals' => [
                'total' => $deals_total,
                'pending' => $deals_pending,
                'closed' => $deals_closed,
                'cancelled' => $deals_cancelled,
            ],

            // Charts
            'series' => [
                'daily_listings' => $daily_listings,
                'daily_deals' => $daily_deals,
            ],
            'top_brokers' => $top_brokers,

            // Recent
            'recent_properties' => $recent_properties,
            'recent_users' => $recent_users,
            'upcoming_trippings' => $upcoming_trippings,
        ]);
    }

}
