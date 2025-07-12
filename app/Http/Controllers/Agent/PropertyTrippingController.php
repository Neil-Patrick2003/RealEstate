<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PropertyTrippingController extends Controller
{
    public function index(){
        return Inertia::render('Agent/Tripping/Trippings', []);
    }
}
