<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SellerController extends Controller
{
    public function index()
    {
        $sellerId = auth()->id();

        // KPIs
        $totalProperties = Property::where('seller_id', $sellerId)->count();
        $totalInquiries  = Inquiry::where('seller_id', $sellerId)->count();
        $totalViews      = Property::where('seller_id', $sellerId)->sum('views');
        $soldProperties  = Property::where('seller_id', $sellerId)->where('status', 'Sold')->count();

        // Inquiry status breakdown (pending/accepted/rejected/cancelled)
        $inquiriesByStatus = Inquiry::where('seller_id', $sellerId)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        // Charts: last 12 months
        $start = now()->startOfMonth()->subMonths(11);
        $end   = now()->endOfMonth();

        $propertiesByMonth = Property::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as ym, COUNT(*) as total')
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        $inquiriesByMonth = Inquiry::where('seller_id', $sellerId)
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as ym, COUNT(*) as total')
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Recent lists
        $recentProperties = Property::where('seller_id', $sellerId)
            ->latest()
            ->take(6)
            ->get(['id','title','address','image_url','status','created_at','views','price']);

        $recentInquiries = Inquiry::with([
            'property:id,title,image_url,address,price',
            'agent:id,name,photo_url',
        ])
            ->where('seller_id', $sellerId)
            ->latest()
            ->take(6)
            ->get(['id','status','created_at','property_id','agent_id','notes']);

        return Inertia::render('Dashboard', [
            'kpi' => [
                'total_properties' => $totalProperties,
                'total_inquiries'  => $totalInquiries,
                'total_views'      => $totalViews,
                'sold_properties'  => $soldProperties,
                'inquiries_status' => [
                    'Pending'   => $inquiriesByStatus['Pending']   ?? 0,
                    'Accepted'  => $inquiriesByStatus['Accepted']  ?? 0,
                    'Rejected'  => $inquiriesByStatus['Rejected']  ?? 0,
                    'Cancelled' => $inquiriesByStatus['Cancelled'] ?? 0,
                ],
            ],
            'charts' => [
                'propertiesByMonth' => $propertiesByMonth,
                'inquiriesByMonth'  => $inquiriesByMonth,
            ],
            'queues' => [
                'recent_properties' => $recentProperties,
                'recent_inquiries'  => $recentInquiries,
            ],
            'auth_user' => auth()->user(),
        ]);
    }
}
