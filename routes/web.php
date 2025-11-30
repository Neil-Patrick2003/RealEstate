<?php

use App\Http\Controllers\Buyer\FavouriteController;
use App\Http\Controllers\Buyer\FeedbackController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\ExportPdfController;
use App\Http\Controllers\HomePage\ContactController;
use App\Http\Controllers\HomePage\HomePageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PropertyTrendsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Seller\ChannelController;
use App\Http\Controllers\Seller\ChatController;
use App\Http\Controllers\Seller\MessageController;
use App\Http\Controllers\Seller\PropertyController;
use App\Http\Controllers\Seller\PropertyImageController;
use App\Http\Controllers\Seller\TransactionController;
use App\Http\Controllers\Seller\TrippingController;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function (Request $request) {

    $featured = \App\Models\Property::with('project')
    ->  where('status', 'Published')
        ->orderBy('views', 'desc')
        ->latest()
        ->take(3)
        ->get();

    $developers = \App\Models\Developer::with('projects')
        ->latest()
        ->get();

    $members = \App\Models\User::whereIn('role', [ 'Admin', 'Broker', 'Agent'])
        ->orderByRaw("FIELD(role, 'Broker', 'Agent')")
        ->oldest()
        ->get();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'featured' => $featured,
        'developers' => $developers,
        'members' => $members,
    ]);
});

Route::get('/properties', [\App\Http\Controllers\Buyer\PropertyController::class, 'index'])->name('properties');
Route::get('/properties/{property}', [\App\Http\Controllers\PropertyController::class, 'show'])->name('properties.show');
Route::get('/explore/projects', [ProjectController::class, 'index']);
Route::get('/explores/projects/{project}', [ProjectController::class, 'show']);
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/about', [HomePageController::class, 'about'])->name('about');
Route::get('/blogs', [HomePageController::class, 'blogs'])->name('services');


Route::get('/search', [SearchController::class, 'index'])->name('search');
//Route::get('/search', [SearchController::class, 'show']);



//all auth user
Route::middleware(['auth'])->group(function () {
    Route::get('/post-property', function(){
        return Inertia::render('Seller/ListProperty');
    });
    Route::post('/feedback', [\App\Http\Controllers\Buyer\FeedbackController::class,'store']);
    Route::post('/post-property', [\App\Http\Controllers\Seller\PropertyController::class,'store'])->name('post-property');
});

Route::middleware(['auth', ])->group(function () {
    Route::get('/seller/dashboard', [\App\Http\Controllers\Seller\SellerController::class, 'index'])->name('seller.dashboard');
    Route::get('/seller/properties', [PropertyController::class, 'index']);
    Route::get('/seller/properties/{property}', [ PropertyController::class, 'show']);
    Route::get('/seller/properties/{property}/edit', [ PropertyController::class, 'edit']);
    Route::patch('/seller/properties/{property}/edit', [ PropertyController::class, 'update'])->name('seller.properties.update');
    Route::delete('/seller/properties/{id}', [ PropertyController::class, 'destroy']);
    Route::delete('/seller/properties/{property}/edit/{id}', [ PropertyImageController::class, 'destroy'])->name('seller.properties.destroy');
    Route::post('/seller/properties/{property}/upload-image', [ PropertyImageController::class,  'store']);
    Route::get('/seller/chat', [ChatController::class, 'index'])->name('seller.chat.index');
    Route::get('/seller/chat/channels/{channel}', [ChannelController::class, 'show'])->name('seller.chat.channels.show');
    Route::get('/seller/messages', [MessageController::class, 'index'])->name('seller.messages');
    Route::post('/seller/messages/{receiver}/sent_message', [MessageController::class, 'send']);
    Route::get('/seller/inquiries', [\App\Http\Controllers\Seller\InquiryController::class, 'index']);
    Route::patch('/seller/inquiries/{inquiry}/{action}', [\App\Http\Controllers\Seller\InquiryController::class, 'updateStatus'])->where('action', 'accept|reject');
    Route::get('/seller/inquiries/agent/{agent}', [\App\Http\Controllers\Seller\InquiryController::class, 'show']);
    Route::get('/seller/trippings', [TrippingController::class, 'index']);
    Route::get('/seller/transaction', [TransactionController::class, 'index']);
});

Route::post('/chat/channels/{channel}/messages', [\App\Http\Controllers\Chat\MessageController::class, 'store'])->name('chat.channels.messages.store');





//for agent
Route::get('/agents/dashboard', [\App\Http\Controllers\Agent\AgentController::class, 'index'])->name('agent.dashboard');
Route::get('/agents/properties', [\App\Http\Controllers\Agent\AgentPropertyController::class, 'index'])->name('agent.properties');
Route::post('/agents/properties/{id}/sent-inquiry', [\App\Http\Controllers\Agent\InquiryController::class, 'store'])->middleware('auth')->name('agent.sent-inquiry');
Route::get('/agents/properties/{property}', [\App\Http\Controllers\Agent\AgentPropertyController::class, 'show']);

Route::get('/agents/my-listings', [\App\Http\Controllers\Agent\PropertyListingController::class, 'index'])->name('agents.my-listings');
Route::get('/agents/my-listings/{property_listing}', [\App\Http\Controllers\Agent\PropertyListingController::class, 'show'])->name('agents.my-listings.show');
Route::patch('/agents/my-listings/{property_listing}', [\App\Http\Controllers\Agent\PropertyListingController::class, 'update']);

Route::get('/agents/chat', [\App\Http\Controllers\Agent\ChatController::class, 'index'])->name('agents.chat.index');
Route::get('/agents/chat/channels/{channel}', [\App\Http\Controllers\Agent\ChannelController::class, 'show'])->name('agents.chat.channels.show');
Route::get('/agents/messages', [\App\Http\Controllers\Agent\MessageController::class, 'index']);
Route::get('/agents/messages/{id}', [\App\Http\Controllers\Agent\MessageController::class, 'show']);
Route::post('/agents/messages/{id}', [\App\Http\Controllers\Agent\MessageController::class, 'store']);


Route::get('/agents/inquiries', [\App\Http\Controllers\Agent\InquiryController::class, 'index']);
Route::patch('/agents/inquiries/{inquiry}/accept', [\App\Http\Controllers\Agent\InquiryController::class, 'accept']);
Route::patch('/agents/inquiries/{inquiry}/reject', [\App\Http\Controllers\Agent\InquiryController::class, 'reject']);
Route::patch('/agents/inquiries/{inquiry}', [\App\Http\Controllers\Agent\InquiryController::class, 'cancel']);

Route::get('/agents/deal', [\App\Http\Controllers\Agent\DealController::class, 'index'])->name('agents.deal.index');
Route::put('/agents/deal/{deal}', [\App\Http\Controllers\Agent\DealController::class, 'update'])->name('agents.deals.update');
Route::get('/agents/deal/{deal}/finalize-deal', [\App\Http\Controllers\Agent\DealController::class, 'show'])->name('agents.deals.finalize');
Route::post('/agents/deal/{deal}/finalize-deal', [\App\Http\Controllers\TransactionController::class, 'store'])->name('agents.transaction.store');
//Route::put('/agents/deal/{id}/$', [DealController::class, 'accept']);
Route::put('/agents/deal/{id}/{status}', [DealController::class, 'handleUpdate'])->name('agents.deals.update_status');


Route::get('/agents/transaction', [\App\Http\Controllers\Agent\TransactionController::class, 'index'])->name('agents.transaction.index');

Route::get('/agents/trippings', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'index']);
Route::patch('/agents/trippings/{id}/accept', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'accept']);
Route::patch('/agents/trippings/{id}/decline', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'decline']);
Route::patch('/agents/trippings/{tripping}/reschedule', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'reschedule']);
Route::patch('/agents/trippings/{tripping}/complete', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'complete']);
Route::get('/agents/calendar', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'calendar']);
Route::get('/agents/feedback', [\App\Http\Controllers\Agent\AgentController::class, 'feedback']);


//------------------------------------------buyer---------------------------------------------------
Route::middleware(['auth'])->group(function () {
    Route::post('/property-listings/{propertyListing}/deals', [DealController::class, 'store'])->name('property-listings.deals.store');
    Route::put('/property-listings/{propertyListing}/deals/{deal}', [DealController::class, 'update'])->name('property-listings.deals.update');
});
Route::middleware(['auth', 'role:Buyer' ])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Buyer\BuyerController::class, 'index'])->name('dashboard');
    Route::post('/properties/{id}', [\App\Http\Controllers\Buyer\InquiryController::class, 'store'])->name('inquiry.store');
    Route::get('/inquiries', [\App\Http\Controllers\Buyer\InquiryController::class, 'index']);
    Route::get('/inquiries/{inquiry}', [\App\Http\Controllers\Buyer\InquiryController::class, 'show']);
    Route::patch('/inquiries/{id}/cancel', [\App\Http\Controllers\Buyer\InquiryController::class, 'cancel']);
    Route::get('/chat', [\App\Http\Controllers\Buyer\ChatController::class, 'index'])->name('buyer.chat.index');
    Route::get('/chat/channels/{channel}', [\App\Http\Controllers\Buyer\ChannelController::class, 'show'])->name('buyer.chat.channels.show');
    Route::get('/trippings', [\App\Http\Controllers\Buyer\PropertyTrippingController::class, 'index']);
    Route::post('/trippings', [\App\Http\Controllers\Buyer\PropertyTrippingController::class, 'store']);
    Route::put('/trippings/{tripping}', [\App\Http\Controllers\Buyer\PropertyTrippingController::class, 'update']);
    Route::get('/favourites', [\App\Http\Controllers\Buyer\FavouriteController::class, 'index']);
    Route::get('/deals', [DealController::class, 'index']);
    Route::get('/deals/{deal}', [DealController::class, 'store']);
    Route::put('/deals/{deal}', [DealController::class, 'update'])->name('deal.deals.update');
    Route::put('/deal/{id}/{status}', [DealController::class, 'handleUpdate'])->name('deal.deals.update_status');
    Route::get('/transactions', [\App\Http\Controllers\Buyer\TransactionController::class, 'index'])->name('buyer.transactions.index');
    Route::get('/deals/{deal}/feedback', [FeedbackController::class, 'create'])->name('deals.feedback.create');
    Route::post('/deals/{deal}/feedback', [FeedbackController::class, 'store'])->name('deals.feedback.store');
    Route::post('/favourites/toggle', [\App\Http\Controllers\Property\PropertyController::class, 'toggleFavourite'])->name('favourites.toggle');

});



//---------------------------------broker----------------------------
Route::get('/broker/dashboard', [\App\Http\Controllers\Broker\BrokerController::class, 'index'])->name('broker.dashboard');
Route::get('/broker/agents', [\App\Http\Controllers\Broker\AgentController::class, 'index'])->name('broker.agents');
Route::get('/broker/agents/{id}', [\App\Http\Controllers\Broker\AgentController::class, 'show']);
Route::post('/broker/agents/create', [\App\Http\Controllers\Broker\AgentController::class, 'store']);
Route::patch('/broker/agents/update/{agent}', [\App\Http\Controllers\Broker\AgentController::class, 'update']);
Route::delete('/broker/agents/{id}/delete', [\App\Http\Controllers\Broker\AgentController::class, 'destroy']);

Route::get('/broker/properties', [\App\Http\Controllers\Broker\PropertyController::class, 'index'])->name('broker.properties');
Route::get('/broker/properties/create', [\App\Http\Controllers\Broker\PropertyController::class, 'create'])->name('broker.properties.create');
Route::post('/broker/properties/create', [\App\Http\Controllers\Broker\PropertyController::class, 'store']);

Route::patch('/broker/properties/{propertyListing}/publish', [\App\Http\Controllers\Broker\PropertyController::class, 'publish']);
Route::patch('/broker/properties/{propertyListing}/unpublish', [\App\Http\Controllers\Broker\PropertyController::class, 'unpublish']);
Route::get('/broker/properties/{propertyListing}', [\App\Http\Controllers\Broker\PropertyController::class, 'show']);
Route::get('/broker/properties/{propertyListing}/edit', [\App\Http\Controllers\Broker\PropertyController::class, 'edit']);
Route::patch('/broker/properties/{property}/edit', [\App\Http\Controllers\Broker\PropertyController::class, 'update'])->name('broker.properties.update');

Route::post('/broker/properties/{propertyListing}/assign-agents', [\App\Http\Controllers\PropertyListingAgentController::class, 'store']);


Route::get('/broker/partners', [\App\Http\Controllers\Broker\DeveloperController::class, 'index']);
Route::post('/broker/partners/create', [\App\Http\Controllers\Broker\DeveloperController::class, 'store']);
Route::get('/broker/partners/{id}', [\App\Http\Controllers\Broker\DeveloperController::class, 'show']);

Route::get('/select-role', [\App\Http\Controllers\GoogleAuthController::class, 'storeSelectedRole']);
Route::get('/google/auth', [\App\Http\Controllers\GoogleAuthController::class, 'redirect'])->name('google-auth');
Route::get('/auth/google/callback', [\App\Http\Controllers\GoogleAuthController::class, 'callback']);;

Route::get('/broker/inquiries', [\App\Http\Controllers\Broker\InquiryController::class, 'index']);
Route::patch('/broker/inquiries/{inquiry}/{action}', [\App\Http\Controllers\Broker\InquiryController::class, 'update'])->where('action', 'accept|reject');
Route::get('/broker/inquiries/{inquiry}', [\App\Http\Controllers\Broker\InquiryController::class, 'show']);

Route::get('/broker/trippings', [\App\Http\Controllers\Broker\TrippingController::class, 'index']);
Route::patch('/broker/trippings/{id}/{action}', [\App\Http\Controllers\Broker\TrippingController::class, 'update'])->name('broker.trippings.update');;


Route::get('/broker/transactions', [\App\Http\Controllers\Broker\TransactionController::class, 'index']);

Route::get('/broker/deals', [\App\Http\Controllers\Broker\DealController::class, 'index']);
Route::get('/broker/deal/{deal}/finalize-deal', [\App\Http\Controllers\Broker\DealController::class, 'show'])->name('broker.deals.finalize');
Route::put('/broker/deals/{deal}/{status}', [\App\Http\Controllers\Broker\DealController::class, 'update'])->name('broker.deals.update');
Route::patch('/broker/deals/{deal}', [\App\Http\Controllers\Broker\DealController::class, 'counter'])->name('broker.deals.counter-offer');;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    //posting property
    Route::get('/post-property', function(){

        $agents = \App\Models\User::where('role', 'Agent')
            ->with('property_listings')
            ->get();


        return Inertia::render('Seller/ListProperty', [
            'agents' => $agents,
        ]);
    });

    //store
//    Route::post('/post-property', [PropertyController::class, 'store'])->name('post-');

    Route::get('/all-agents', [\App\Http\Controllers\Agent\AgentController::class, 'loadAgents'])->name('get-all-agents');
});


Route::get('/maps', [\App\Http\Controllers\Property\PropertyController::class, 'map']);
Route::get('/maps/property/{id}', [\App\Http\Controllers\Property\PropertyController::class, 'map_show']);
Route::get('/agents/{agent}', [\App\Http\Controllers\Agent\AgentController::class, 'show']);
Route::get('properties/{property}', [\App\Http\Controllers\PropertyController::class, 'show']);

Route::prefix('export')->group(function () {
    Route::get('/monthly-transactions', [ExportPdfController::class, 'monthlySalesTransactions'])
        ->name('export.pdf.transactions');

    Route::get('/monthly-by-agent', [ExportPdfController::class, 'monthlySalesByAgent'])
        ->name('export.pdf.by-agent');

    Route::get('/monthly-by-role', [ExportPdfController::class, 'monthlySalesByRole'])
        ->name('export.pdf.by-role');

    Route::get('/export/monthly-handled-vs-sold', [\App\Http\Controllers\ExportPdfController::class, 'monthlyHandledVsSoldByUser'])
        ->name('export.pdf.handled-vs-sold');

    Route::get('/analytics/property-trends.json', [PropertyTrendsController::class, 'json'])
        ->name('analytics.property.trends.json');

    Route::get('/analytics/property-trends', [PropertyTrendsController::class, 'dashboard'])
        ->name('analytics.property.trends');
});


Route::middleware(['auth', 'web'])->group(function () {
    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/mark-page-read', [NotificationController::class, 'markPageNotificationsAsRead']);
});

Route::get('/verify-email', function () {
    return Inertia::render('Auth/VerifyEmail'); // Inertia page
})->middleware('auth')->name('verification.notice');

Route::get('/verify-email/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect('/dashboard');
})->middleware(['auth', 'signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return back()->with('status', 'verification-link-sent');
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

require __DIR__.'/auth.php';
