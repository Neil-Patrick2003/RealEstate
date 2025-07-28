<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\Developer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DeveloperController extends Controller
{
    public function index(){

        $developers = Developer::all();

        return Inertia::render('Broker/Partner/Partner', [
            'developers' => $developers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'company_logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'trade_name' => 'required',
            'registration_number' => 'required',
            'license_number' => 'required',
            'head_office_address' => 'required',
            'website_url' => 'nullable|url',
            'facebook_url' => 'nullable|url',
        ]);

        if ($request->hasFile('company_logo')) {
            $file = $request->file('company_logo');
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $company_logo = $file->storeAs('images', $filename, 'public');
        }

        Developer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'company_logo' => $company_logo,
            'trade_name' => $validated['trade_name'],
            'registration_number' => $validated['registration_number'],
            'license_number' => $validated['license_number'],
            'head_office_address' => $validated['head_office_address'],
            'website_url' => $validated['website_url'],
            'facebook_url' => $validated['facebook_url'],
        ]);

//        User::create([
//            'name' => $validated['name'],
//            'email' => $validated['email'],
//            'password' => bcrypt(Str::random(10)),
//            'role' => 'Seller',
//        ]);


        return redirect()->back();

    }

    public function  show($id)
    {
        $developer = Developer::with('properties')->find($id);

        return Inertia::render('Broker/Partner/ShowPartner', [
            'developer' => $developer,
        ]);
    }
}
