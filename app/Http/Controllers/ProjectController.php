<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(){

        $projects = \App\Models\Project::with('inventoryPools', 'inventoryPools.block', 'inventoryPools.house_type')
            ->latest()
            ->paginate(12);


        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function show(Request $request, Project $project)
    {
        $project->load([
            'inventoryPools',
            'inventoryPools.block',
            'inventoryPools.house_type',
            'developer:id,name'
        ]);


        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

}
