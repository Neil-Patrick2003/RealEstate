<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use Inertia\Inertia;

class SellerController extends Controller
{
    public function index()
    {
        $total_properties = Property::where('seller_id', auth()->id())->count();
        $total_inquiries = Inquiry::where('seller_id', auth()->id())->count();
        $total_views = Property::where('seller_id', auth()->id())->sum('views');
        $sold_properties = Property::where('seller_id', auth()->id())->where('status', 'Sold')->count();
        $recent_properties = Property::where('seller_id', auth()->id())->orderBy('created_at', 'desc')->take(6)->get();
        $recent_inquiries = Inquiry::with('property', 'agent')->where('seller_id', auth()->id())->orderBy('created_at', 'desc')->take(5)->get();
        $auth_user = auth()->user();
        return Inertia::render('Dashboard', [
            'total_properties' => $total_properties,
            'total_inquiries' => $total_inquiries,
            'total_views' => $total_views,
            'sold_properties' => $sold_properties,
            'recent_properties' => $recent_properties,
            'recent_inquiries' => $recent_inquiries,
            'auth_user' => $auth_user,
        ]);



    }
}
