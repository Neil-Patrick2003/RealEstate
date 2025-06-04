<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PropertyController extends Controller
{   
    public function store(Request $request){
        $validated = $request->validate([
            'title' => 'required',
            ''
        ]);



    }
}
