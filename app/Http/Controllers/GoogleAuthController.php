<?php

namespace App\Http\Controllers;


use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{

        public function storeSelectedRole(Request $request)
        {

            $request->validate([
                'role' => 'required|in:buyer,seller',
            ]);

            session(['social_role' => $request->role]);

            return redirect()->route('google-auth');
        }

    public function redirect(){

        return Socialite::driver('google')->redirect();
    }

    public function callback(){
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('google_id', $googleUser->getId())->first();

            if (!$user) {
                $new_user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'role' => session('social_role'),
                ]);

                Auth::login($new_user);

                if($new_user->role === 'Buyer'){
                    return redirect()->intended('dashboard');
                }
                else if($new_user->role === 'Seller'){
                    return redirect()->intended('seller.dashboard');
                }
                else{
                    return redirect()->intended('dashboard');
                }

            }
            else{
                Auth::login($user);
                if($user->role === 'Seller'){
                    return redirect()->intended('seller/dashboard');
                }

                else{
                    return redirect()->intended('dashboard');
                }
            }
        }catch (\Throwable $e){
            dd('Something went wrong'. $e->getMessage());
        }

    }

}
