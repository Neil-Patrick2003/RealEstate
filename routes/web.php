<?php

use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Seller\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Seller\PropertyController;
use App\Http\Controllers\Seller\PropertyImageController;
use App\Http\Controllers\Seller\TrippingController;
use App\Http\Controllers\Seller\TransactionController;
use App\Models\Property;
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
    })->name('dashboard');
    
    
    Route::get('/properties/{property}', [ PropertyController::class, 'show']);
    Route::delete('/properties/{id}', [ PropertyController::class, 'destroy']);



    Route::get('/properties/{property}/edit', [ PropertyController::class, 'edit']);
    Route::patch('/properties/{proeprty}/edit', [ PropertyController::class, 'update'])->name('seller.properties.update');
    Route::delete('/properties/{property}/edit/{id}', [ PropertyImageController::class, 'destroy'])->name('seller.properties.destroy');
    Route::post('/properties/{property}/upload-image', [ PropertyImageController::class,  'store']);

    //message
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages/{receiver}/sent_message', [MessageController::class, 'send']);

    //trippings
    Route::get('/trippings', [TrippingController::class, 'index']);

    //transaction
    Route::get('/my-sales', [TransactionController::class, 'index']);



    Route::get('/properties', [PropertyController::class, 'index'])->name('my-properties');


});


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
