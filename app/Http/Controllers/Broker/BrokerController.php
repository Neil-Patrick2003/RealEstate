<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\Developer;
use App\Models\Inquiry;
use App\Models\PropertyListing;
use App\Models\PropertyTripping;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BrokerController extends Controller
{
//    public function index()
//    {
//        return Inertia::render('Broker/Dashboard', []);
//
//
//    }


    public function index()
    {
        $brokerId = auth()->id();
        $today    = now()->toDateString();
        $nowTime  = now()->format('H:i:s');

        // KPI: listings
        $listingBase = PropertyListing::with('property')
            ->where('broker_id', $brokerId);

        $listings = $listingBase->clone()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(status = 'Published') as published")
            ->selectRaw("SUM(status = 'Unpublished') as unpublished")
            ->selectRaw("SUM(status = 'Draft') as draft")
            ->first();

        $presell = $listingBase->clone()
            ->whereHas('property', fn($q) => $q->where('isPresell', 1))
            ->count();

        // KPI: inquiries (scoped to broker's listings)
        $inquiriesBase = Inquiry::where('broker_id', $brokerId);
        $inquiriesKpi = $inquiriesBase->clone()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(status = 'Pending') as pending")
            ->selectRaw("SUM(status = 'Accepted') as accepted")
            ->selectRaw("SUM(status = 'Rejected') as rejected")
            ->selectRaw("SUM(status = 'Cancelled') as cancelled")
            ->first();

        // KPI: deals
        $dealsBase = Deal::whereHas('property_listing', fn($q) => $q->where('broker_id', $brokerId));
        $dealsKpi = $dealsBase->clone()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(status = 'Pending') as pending")
            ->selectRaw("SUM(status = 'Accepted') as accepted")
            ->selectRaw("SUM(status = 'Closed' OR status = 'Sold') as sold")
            ->selectRaw("SUM(status = 'Cancelled' OR status = 'Declined') as cancelled")
            ->first();

        // Chart: deals by month (last 12) - Count instead of value
        $dealsByMonth = $dealsBase->clone()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym")
            ->selectRaw("COUNT(*) as total")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Chart: inquiries by month (last 12)
        $inquiriesByMonth = $inquiriesBase->clone()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym")
            ->selectRaw("COUNT(*) as total")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Chart: listings by status
        $listingsByStatus = $listingBase->clone()
            ->select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Chart: inquiries by source type
        $inquiriesByType = $inquiriesBase->clone()
            ->selectRaw("CASE
            WHEN buyer_id IS NOT NULL AND seller_id IS NULL THEN 'Buyer Inquiry'
            WHEN seller_id IS NOT NULL THEN 'Seller Request'
            ELSE 'Internal Inquiry'
        END as type")
            ->selectRaw('COUNT(*) as count')
            ->groupBy('type')
            ->get();

        // Chart: deal conversion rate by month
        $conversionByMonth = $inquiriesBase->clone()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym")
            ->selectRaw("COUNT(*) as total_inquiries")
            ->selectRaw("SUM(status = 'Accepted') as accepted_inquiries")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->map(function ($item) {
                $conversionRate = $item->total_inquiries > 0
                    ? round(($item->accepted_inquiries / $item->total_inquiries) * 100, 1)
                    : 0;
                return [
                    'ym' => $item->ym,
                    'conversion_rate' => $conversionRate,
                    'total_inquiries' => $item->total_inquiries,
                    'accepted_inquiries' => $item->accepted_inquiries
                ];
            });

        // Performance metrics
        $performance = [
            'inquiry_response_rate' => $inquiriesKpi->total > 0
                ? round((($inquiriesKpi->accepted + $inquiriesKpi->rejected) / $inquiriesKpi->total) * 100, 1)
                : 0,
            'deal_conversion_rate' => $inquiriesKpi->total > 0
                ? round(($dealsKpi->total / $inquiriesKpi->total) * 100, 1)
                : 0,
            'active_listing_rate' => $listings->total > 0
                ? round(($listings->published / $listings->total) * 100, 1)
                : 0,
        ];

        // Work queue
        $latestPendingInquiries = $inquiriesBase->clone()
            ->with(['property'])
            ->where('status', 'Pending')
            ->latest()->limit(5)->get();

        $pendingDeals = $dealsBase->clone()
            ->with(['propertyListing.property', 'buyer'])
            ->where('status', 'Pending')
            ->latest()->limit(5)->get();

        // Recent activity (last 7 days)
        $recentActivity = collect()
            ->merge(
                $inquiriesBase->clone()
                    ->with(['property'])
                    ->where('created_at', '>=', now()->subDays(7))
                    ->selectRaw("'inquiry' as type, id, created_at, status, notes")
                    ->get()
            )
            ->merge(
                $dealsBase->clone()
                    ->with(['propertyListing.property'])
                    ->where('created_at', '>=', now()->subDays(7))
                    ->selectRaw("'deal' as type, id, created_at, status, amount")
                    ->get()
            )
            ->sortByDesc('created_at')
            ->take(8);

        // Upcoming trippings
        $upcomingTrippings = PropertyTripping::query()
            ->with([
                'property:id,title,image_url,address',
                'buyer:id,name,email,contact_number',
            ])
            ->where('broker_id', $brokerId)
            ->whereNotNull('visit_date')
            ->where(function ($q) use ($today, $nowTime) {
                $q->where('visit_date', '>', $today)
                    ->orWhere(function ($q2) use ($today, $nowTime) {
                        $q2->where('visit_date', $today)
                            ->where('visit_time', '>=', $nowTime);
                    });
            })
            ->orderBy('visit_date')
            ->orderBy('visit_time')
            ->limit(5)
            ->get();

        // Other aggregates
        $agentsCount = User::where('broker_id', $brokerId)->count();
        $partnersCount = Developer::count();

        return Inertia::render('Broker/Dashboard', [
            'kpi' => [
                'listings'   => $listings,
                'presell'    => $presell,
                'inquiries'  => $inquiriesKpi,
                'deals'      => $dealsKpi,
                'agents'     => $agentsCount,
                'partners'   => $partnersCount,
                'performance' => $performance,
            ],
            'charts' => [
                'dealsByMonth' => $dealsByMonth,
                'inquiriesByMonth' => $inquiriesByMonth,
                'inquiriesThisMonth' => $inquiriesKpi, // For the status pie chart
                'listingsByStatus' => $listingsByStatus,
                'inquiriesByType' => $inquiriesByType,
                'conversionByMonth' => $conversionByMonth,
            ],
            'queues' => [
                'pendingInquiries' => $latestPendingInquiries,
                'pendingDeals' => $pendingDeals,
                'upcomingTrippings' => $upcomingTrippings,
                'recentActivity' => $recentActivity,
            ],
        ]);
    }





}



