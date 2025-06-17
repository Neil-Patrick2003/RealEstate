<?php

use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Seller\PropertyController;
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
