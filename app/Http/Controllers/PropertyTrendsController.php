<?php

namespace App\Http\Controllers;

use App\Services\PropertyTrendsService;
use Illuminate\Http\Request;

class PropertyTrendsController extends Controller
{
    public function json(Request $request, PropertyTrendsService $service)
    {
        $data = $service->summarize($request->query('from'), $request->query('to'));
        return response()->json($data);
    }

    public function dashboard(Request $request, PropertyTrendsService $service)
    {
        $data = $service->summarize($request->query('from'), $request->query('to'));
        return view('analytics.property-trends', compact('data'));
    }
}
