<?php

namespace App\Http\Controllers;

use App\Models\PropertyListing;
use App\Models\PropertyListingAgent;
use Illuminate\Http\Request;

class PropertyListingAgentController extends Controller
{
    public function store(Request $request, $id)
    {
        $property_listing = PropertyListing::findOrFail($id);

        $agentIds = $request->input('agent_ids', []);

        $property_listing->agents()->sync($agentIds);

        return redirect()->back()->with('success', 'Agents assigned successfully.');
    }
}
