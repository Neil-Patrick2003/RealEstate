<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Seller\MessageController;
use App\Http\Controllers\Seller\PropertyController;
use App\Http\Controllers\Seller\PropertyImageController;
use App\Http\Controllers\Seller\TransactionController;
use App\Http\Controllers\Seller\TrippingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});



//all auth user
Route::middleware(['auth'])->group(function () {
    Route::get('/post-property', function(){
        return Inertia::render('Seller/ListProperty');
    })->name('post-property');

});

// only seller  addd it ----->>>>'role:Seller'<<<<-------
Route::middleware(['auth', ])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('seller.dashboard');


    Route::get('/properties/{property}', [ PropertyController::class, 'show']);
    Route::delete('/properties/{id}', [ PropertyController::class, 'destroy']);



    Route::get('/properties/{property}/edit', [ PropertyController::class, 'edit']);
    Route::patch('/properties/{proeprty}/edit', [ PropertyController::class, 'update'])->name('seller.properties.update');
    Route::delete('/properties/{property}/edit/{id}', [ PropertyImageController::class, 'destroy'])->name('seller.properties.destroy');
    Route::post('/properties/{property}/upload-image', [ PropertyImageController::class,  'store']);

    //message
    Route::get('/messages', [MessageController::class, 'index'])->name('seller.messages');
    Route::post('/messages/{receiver}/sent_message', [MessageController::class, 'send']);

    //Inquiries
    Route::get('/inquiries', [\App\Http\Controllers\Seller\InquiryController::class, 'index']);
    Route::patch('/sellers/inquiries/{inquiry}/{action}', [\App\Http\Controllers\Seller\InquiryController::class, 'updateStatus'])->where('action', 'accept|reject');
    //tripping
    Route::get('/trippings', [TrippingController::class, 'index']);

    //transaction
    Route::get('/my-sales', [TransactionController::class, 'index']);



    Route::get('/properties', [PropertyController::class, 'index'])->name('my-properties');


});


//for agent
Route::get('/agents/dashboard', [\App\Http\Controllers\Agent\AgentController::class, 'index'])->name('agent.dashboard');
Route::get('/agents/properties', [\App\Http\Controllers\Agent\AgentPropertyController::class, 'index'])->name('agent.properties');
Route::get('/agents/my-listings', [\App\Http\Controllers\Agent\PropertyListingController::class, 'index'])->name('agents.my-listings');
Route::get('/agents/my-listings/{property_listing}', [\App\Http\Controllers\Agent\PropertyListingController::class, 'show']);


//sent inquiry
Route::post('/agents/properties/{id}/sent-inquiry', [\App\Http\Controllers\Agent\InquiryController::class, 'store'])->middleware('auth')->name('agent.sent-inquiry');


Route::get('/agents/messages', [\App\Http\Controllers\Agent\MessageController::class, 'index']);
Route::get('/agents/messages/{id}', [\App\Http\Controllers\Agent\MessageController::class, 'show']);
Route::post('/agents/messages/{id}', [\App\Http\Controllers\Agent\MessageController::class, 'store']);


Route::get('/agents/inquiries', [\App\Http\Controllers\Agent\InquiryController::class, 'index']);
Route::patch('/agents/inquiries/{id}', [\App\Http\Controllers\Agent\InquiryController::class, 'update']);







Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/post-property', function(){
        return Inertia::render('Seller/ListProperty');
    })->name('post-property');

    Route::post('/post-property', [PropertyController::class, 'store'])->name('post-property');
});

require __DIR__.'/auth.php';
