<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'contact_number' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'photo_url' => 'nullable|url|max:255',
            'role' => 'nullable|in:Seller,Buyer,Agent',
        ]);


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
//            'password' => Hash::make($request->password),
            'password' => $request->password,
            'role' => $request->role,
            'contact_number' => $request->contact_number ?? null,
            'address' => $request->address ?? null,
            'bio' => $request->bio ?? null,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return match ($user->role) {
            'Seller' => redirect()->intended(route('seller.dashboard')),
            'Agent'  => redirect()->intended(route('agent.dashboard')),
            'Admin'  => redirect()->intended(route('admin.dashboard')),
            default  => redirect()->intended(route('dashboard')),
        };
    }
}
