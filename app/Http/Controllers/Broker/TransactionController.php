<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('Broker/Transaction/index');
    }
}
