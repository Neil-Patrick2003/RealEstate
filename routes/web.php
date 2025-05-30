<?php

use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Seller\PropertyController;
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


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// Route::get(uri: '/admin/systems', [SystemController::class, 'index']);


Route::get('/post-property', function(){
    return Inertia::render('Seller/ListProperty');
})->middleware('auth')->name('post-property');

Route::post('/post-property', [PropertyController::class, 'store'])->middleware('auth')->name('post-property');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
