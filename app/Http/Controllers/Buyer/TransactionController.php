<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
       return Inertia::render('Buyer/Transactions/Transactions');
    }
}
