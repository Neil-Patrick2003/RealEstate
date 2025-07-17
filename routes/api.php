<?php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Route;



Route::post('/sanctum/token', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'device_name' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    

    return response()->json([
    'token' => $user->createToken($request->device_name)->plainTextToken
]);

});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');




//------------------middleware mobile-=----------------------------

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    });
    


Route::get('/properties', function () {
        return [
            [
                'id' => 1,
                'title' => 'Modern Villa',
                'location' => 'LA',
                'details' => '4 Beds • 3 Baths • 2500 sqft',
                'image' => 'https://images.unsplash.com/photo-1560448070-4561d88d83e4?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'id' => 2,
                'title' => 'City Apartment',
                'location' => 'NY',
                'details' => '2 Beds • 2 Baths • 1200 sqft',
                'image' => 'https://images.unsplash.com/photo-1572120360610-d971b9b8f27f?auto=format&fit=crop&w=400&q=80',
            ],
            // Add more if needed
        ];
    });
});


