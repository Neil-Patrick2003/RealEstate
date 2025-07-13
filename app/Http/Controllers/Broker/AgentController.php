<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index()
    {
        return Inertia::render('Broker/Agent/Index', []);
    }
}
