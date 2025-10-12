<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrippingController extends Controller
{
    public function index(){
        return Inertia::render('Seller/Tripping/Index');
    }
}
