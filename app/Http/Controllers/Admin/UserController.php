<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()
        ->paginate(15);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(){
        $brokers = User::where('role', 'Broker')->latest()->get();
        return Inertia::render('Admin/Users/Create', [
            'brokers' => $brokers,
        ]);

    }

    public function store(Request $request)
    {

        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'role' => 'required',
            'broker_id' => 'nullable',
            'contact_number' => 'required',
            'address' => 'required',
            'photo_url' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required',
        ]);


        $avatar = null;
        if ($request->hasFile('photo_url')) {
            $file = $request->file('photo_url');
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $avatar = $file->storeAs('images', $filename, 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'broker_id' => $request->broker_id,
            'contact_number' => $request->contact_number,
            'address' => $request->address,
            'photo_url' => $avatar,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.users')->with('success', 'User created successfully.');
    }


    public function edit(User $user)
    {

        $brokers = User::where('role', 'Broker')->latest()->get();


        return Inertia::render('Admin/Users/Create', [
            'user' => $user,
            'brokers' => $brokers,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required',
            'broker_id' => 'nullable',
            'contact_number' => 'required',
            'address' => 'required',
            'photo_url' => 'nullable|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required',

        ]);

        $avatar = $user->photo_url;

        if ($request->hasFile('photo_url')) {
            $file = $request->file('photo_url');
            $filename = time() . '_' . preg_replace('/\s+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $avatar = $file->storeAs('images', $filename, 'public');
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'broker_id' => $request->broker_id,
            'contact_number' => $request->contact_number,
            'address' => $request->address,
            'photo_url' => $avatar,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.users')->with('success', 'User updated successfully.');

    }

    public function destroy(User $user)
    {
        if ($user->inquiriesAsBuyer()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They have buyer inquiries.']);
        }

        if ($user->sellerInquiriesAsAgent()->exists()) {
            return redirect()->back()->withs(['error' => 'Cannot delete user. They have seller inquiries as agent.']);
        }

        if ($user->buyerInquiriesAsAgent()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They have buyer inquiries as agent.']);
        }

        if ($user->properties()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They are a seller with listed properties.']);
        }

        if ($user->property()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They are an agent for some properties.']);
        }

        if ($user->listing()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They have property listings.']);
        }

        if ($user->messages()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They have messages.']);
        }

        if ($user->favourites()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They have favourite properties.']);
        }

        if ($user->feedback()->exists() || $user->feedbackReceived()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They are involved in feedback.']);
        }

        if ($user->agent_trippings()->exists() || $user->buyer_trippings()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They have property trippings.']);
        }

        if ($user->develops()->exists()) {
            return redirect()->back()->with(['error' => 'Cannot delete user. They are associated with a developer profile.']);
        }

        // ✅ All good — proceed to delete
        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }


}
