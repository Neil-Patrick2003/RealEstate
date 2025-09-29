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
        $today    = now()->toDateString();   // e.g. "2025-09-29"
        $nowTime  = now()->format('H:i:s');  // e.g. "14:05:00"

        // KPI: listings
        $listingBase = PropertyListing::with('property')
            ->where('broker_id', $brokerId);

        $listings = $listingBase->clone()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(status = 'Published') as published")
            ->selectRaw("SUM(status = 'Unpublished') as unpublished")
            ->first();

        $presell = $listingBase->clone()
            ->whereHas('property', fn($q) => $q->where('isPresell', 1))
            ->count();

        // KPI: inquiries (scoped to broker’s listings)
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
            ->selectRaw('COALESCE(SUM(CASE WHEN status IN ("Accepted","Closed","Sold") THEN amount END),0) as pipeline_value')
            ->first();

        // Chart: deals value by month (last 12)
        $dealsByMonth = $dealsBase->clone()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym")
            ->selectRaw("SUM(amount) as total")
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Chart: inquiries by status (this month)
        $inquiriesThisMonth = $inquiriesBase->clone()
            ->select('status', DB::raw('COUNT(*) as cnt'))
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->groupBy('status')->get();

        // Work queue
        $latestPendingInquiries = $inquiriesBase->clone()
            ->with(['property'])
            ->where('status', 'Pending')
            ->latest()->limit(5)->get();

        $pendingDeals = $dealsBase->clone()
            ->with(['propertyListing.property', 'buyer'])
            ->where('status', 'Pending')
            ->latest()->limit(5)->get();

        // Upcoming trippings (assuming Tripping model or reuse Inquiry with schedule)
        $upcomingTrippings = PropertyTripping::query()
            ->with([
                'property:id,title,image_url,address',
                'buyer:id,name,email,contact_number',
            ])
            ->where('broker_id', $brokerId)
            ->whereNotNull('visit_date')
            ->where(function ($q) use ($today, $nowTime) {
                $q->where('visit_date', '>', $today) // any future date
                ->orWhere(function ($q2) use ($today, $nowTime) { // today but later time
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
            ],
            'charts' => [
                'dealsByMonth' => $dealsByMonth,
                'inquiriesThisMonth' => $inquiriesThisMonth,
            ],
            'queues' => [
                'pendingInquiries' => $latestPendingInquiries,
                'pendingDeals' => $pendingDeals,
                'upcomingTrippings' => $upcomingTrippings,
            ],
        ]);
    }





}



