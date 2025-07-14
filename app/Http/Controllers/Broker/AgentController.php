<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index()
    {

        $agents = User::where('broker_id', auth()->id())->latest()->paginate(10);

        return Inertia::render('Broker/Agent/Index', [
            'agents' => $agents,
        ]);
    }

    public function create(){

    }

    public function  store(Request $request)
    {



        $data = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'contact_number' => 'required',
            'confirm_password' => 'required|same:password',
            'image_url' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('image_url')) {
            $file = $request->file('image_url');
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $propertyImageUrl = $file->storeAs('images', $filename, 'public');
        }



        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'agent',
            'contact_number' => $request->contact_number,
            'address' => $request->address,
            'photo_url' => $propertyImageUrl,
            'broker_id' => auth()->id(),

        ]);

        return redirect()->back()->with('success', 'Agent Created Successfully');
    }

    public function update(Request $request, User $agent)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $agent->id,
            'contact_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'password' => 'nullable|confirmed|min:6',
        ]);

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        } else {
            unset($data['password']);
        }

        $agent->update($data);

        return back()->with('success', 'Agent updated successfully.');
    }



}
