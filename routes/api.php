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
//        'device_name' => 'required',
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

Route::group(['middleware' => 'auth:sanctum', 'prefix' => '/agent'], function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    });

    Route::get('/inquiries', [\App\Http\Controllers\Api\InquiryController::class, 'index']);
    Route::put('/inquiries/{id}/{action}', [\App\Http\Controllers\Api\InquiryController::class, 'update']);

    Route::get('/properties', [App\Http\Controllers\Api\PropertyController::class, 'index']);;
    Route::post('/properties/{id}/inquire', [\App\Http\Controllers\Api\InquiryController::class, 'store']);

    Route::get('/listing', [App\Http\Controllers\Api\PropertyListingController::class, 'index']);
    Route::get('/listing/{id}', [App\Http\Controllers\Api\PropertyListingController::class, 'show']);
    Route::patch('/listing/{id}', [App\Http\Controllers\Api\PropertyListingController::class, 'update']);

    Route::get('/tripping', [\App\Http\Controllers\Api\TrippingController::class, 'index']);
    Route::put('/tripping/{id}/{action}', [\App\Http\Controllers\Api\TrippingController::class, 'update']);


    Route::get('/chat', [\App\Http\Controllers\Api\ChatController::class, 'index']);
    Route::get('/chat/channels/{channel}', [\App\Http\Controllers\Api\ChatController::class, 'show']);


});


