<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        if ($user && $user->status !== 'active') {
            Auth::logout();

            // Clear session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Return back with error (Inertia will show this in your form errors)
            return back()->withErrors([
                'email' => 'Your account is inactive. Please contact support.',
            ]);
        }



        $request->session()->regenerate();

        sleep(1);

        $role = Auth::user()->role;

        return match ($role) {
            'Seller' => redirect()->intended(route('seller.dashboard')),
            'Agent'  => redirect()->intended(route('agent.dashboard')),
            'Broker' => redirect()->intended(route('broker.dashboard')),
            default  => redirect()->intended(route('dashboard')),
        };


    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
