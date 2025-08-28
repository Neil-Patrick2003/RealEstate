<?php

namespace App\Http\Controllers\Broker;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'asc');
        $perPage = $request->input('perPage', 10);

        $agents = User::withCount([
            'listing as assigned_listings_count' => fn ($q) => $q->where('status', 'Assigned'),
            'listing as published_listings_count' => fn ($q) => $q->where('status', 'Published'),
            'listing as sold_listings_count' => fn ($q) => $q->where('status', 'Sold'),
        ])
            ->where('broker_id', auth()->id())
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name', $sort)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Broker/Agent/Index', compact('agents', 'search', 'sort', 'perPage'));
    }




    public function show($id){
        $user = User::findOrFail($id);

        return Inertia::render('Broker/Agent/Show', [
            'user' => $user,
        ]);
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
            'role' => 'Agent    ',
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

    public function destroy($id){


        $user = User::find($id);
        $user->delete();

        return redirect()->back()->with('success', 'Agent deleted successfully.');
    }




}
