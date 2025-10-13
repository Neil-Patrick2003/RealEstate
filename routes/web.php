<?php

use App\Http\Controllers\Buyer\FeedbackController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Seller\ChannelController;
use App\Http\Controllers\Seller\ChatController;
use App\Http\Controllers\Seller\MessageController;
use App\Http\Controllers\Seller\PropertyController;
use App\Http\Controllers\Seller\PropertyImageController;
use App\Http\Controllers\Seller\TransactionController;
use App\Http\Controllers\Seller\TrippingController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use function Pest\Laravel\get;


Route::get('/', function (Request $request) {

    $featured = \App\Models\Property::with('features', 'images', 'property_listing.agents', 'property_listing.broker')
    ->  where('status', 'Published')
        ->orderBy('views', 'desc')
        ->latest()
        ->take(4)
        ->get();

    $properties = \App\Models\Property::where('status', 'Published')
        ->when($request->search, function ($q) use ($request) {
            $q->where(function ($query) use ($request) {
                $query->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('address', 'like', '%' . $request->search . '%');
            });
        })
        ->when($request->type && $request->type !== 'All', function ($q) use ($request) {
            $q->where('property_type', $request->type);
        })
        ->latest()
        ->get();

    // Get the user's favourited property IDs
    $favouriteIds = auth()->check()
        ? auth()->user()->favourites()->pluck('property_id')->toArray()
        : [];

    $properties = \App\Models\Property::where('status', 'Published')
        ->latest()
        ->get();


    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'favouriteIds' => $favouriteIds,
        'featured' => $featured,
        'properties' => $properties,
    ]);
});


//<-----------------------Header Pages---------------------->
Route::get('/contact', function () {
    return Inertia::render('Headers/ContactPage');
});
Route::get('/security', function () {
    return Inertia::render('Headers/SecurityPage');
});
Route::get('/findagent', function () {
    return Inertia::render('Headers/FindAgentPage');
});
Route::get('/customer', function () {
    return Inertia::render('Headers/CustomersPage');
});
Route::get('/collaboration', function () {
    return Inertia::render('Headers/CollaborationPage');
});
Route::get('/enterprise', function () {
    return Inertia::render('Headers/EnterprisePage');
});

Route::get('/emergency', function () {
    return Inertia::render('Headers/EmergencyPage');
});
Route::get('/community', function () {
    return Inertia::render('Headers/CommunityPage');
});
Route::get('/help', function () {
    return Inertia::render('Headers/HelpPage');
});

Route::get('/gallery', function () {
    return Inertia::render('Headers/GalleryPage');
});
Route::get('/experts', function () {
    return Inertia::render('Headers/ExpertsPage');
});
Route::get('/blog', function () {
    return Inertia::render('Headers/BlogPage');
});
Route::get('/academy', function () {
    return Inertia::render('Headers/AcademyPage');
});
Route::get('/meetups', function () {
    return Inertia::render('Headers/MeetupsPage');
});
Route::get('/updates', function () {
    return Inertia::render('Headers/UpdatesPage');
});
Route::get('/markplace', function () {
    return Inertia::render('Headers/MarkplacePage');
});


//all auth user
Route::middleware(['auth'])->group(function () {
    Route::get('/post-property', function(){
        return Inertia::render('Seller/ListProperty');
    });

    Route::post('/feedback', [\App\Http\Controllers\Buyer\FeedbackController::class,'store']);

    Route::post('/post-property', [\App\Http\Controllers\Seller\PropertyController::class,'store'])->name('post-property');

});

Route::middleware(['auth'])->group(function () {
    Route::get('/seller/dashboard', [\App\Http\Controllers\Seller\SellerController::class, 'index'])->name('seller.dashboard');

    Route::get('/seller/properties', [PropertyController::class, 'index'])->name('my-properties');
    Route::get('/seller/properties/{property}', [ PropertyController::class, 'show']);
    Route::get('/seller/properties/{property}/edit', [ PropertyController::class, 'edit']);
    Route::patch('/seller/properties/{property}/edit', [ PropertyController::class, 'update'])->name('seller.properties.update');
    Route::delete('/seller/properties/{id}', [ PropertyController::class, 'destroy']);

    Route::delete('/seller/properties/{property}/edit/{id}', [ PropertyImageController::class, 'destroy'])->name('seller.properties.destroy');
    Route::post('/seller/properties/{property}/upload-image', [ PropertyImageController::class,  'store']);

    //message
    Route::get('/seller/chat', [ChatController::class, 'index'])->name('seller.chat.index');
    Route::get('/seller/chat/channels/{channel}', [ChannelController::class, 'show'])->name('seller.chat.channels.show');
    Route::post('/chat/channels/{channel}/messages', [\App\Http\Controllers\Chat\MessageController::class, 'store'])->name('chat.channels.messages.store');
    Route::get('/seller/messages', [MessageController::class, 'index'])->name('seller.messages');
    Route::post('/seller/messages/{receiver}/sent_message', [MessageController::class, 'send']);

    //Inquiries
    Route::get('/seller/inquiries', [\App\Http\Controllers\Seller\InquiryController::class, 'index']);
    Route::patch('/seller/inquiries/{inquiry}/{action}', [\App\Http\Controllers\Seller\InquiryController::class, 'updateStatus'])->where('action', 'accept|reject');
    Route::get('/seller/inquiries/agent/{agent}', [\App\Http\Controllers\Seller\InquiryController::class, 'show']);
    //tripping
    Route::get('/seller/trippings', [TrippingController::class, 'index']);

    //transaction
    Route::get('/seller/transaction', [TransactionController::class, 'index']);

});




//for agent
Route::get('/agents/dashboard', [\App\Http\Controllers\Agent\AgentController::class, 'index'])->name('agent.dashboard');
Route::get('/agents/properties', [\App\Http\Controllers\Agent\AgentPropertyController::class, 'index'])->name('agent.properties');
Route::post('/agents/properties/{id}/sent-inquiry', [\App\Http\Controllers\Agent\InquiryController::class, 'store'])->middleware('auth')->name('agent.sent-inquiry');
Route::get('/agents/properties/{property}', [\App\Http\Controllers\Agent\AgentPropertyController::class, 'show']);

Route::get('/agents/my-listings', [\App\Http\Controllers\Agent\PropertyListingController::class, 'index'])->name('agents.my-listings');
Route::get('/agents/my-listings/{property_listing}', [\App\Http\Controllers\Agent\PropertyListingController::class, 'show']);
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

Route::get('/agents/deal', [\App\Http\Controllers\Agent\DealController::class, 'index']);
Route::put('/agents/deal/{deal}', [\App\Http\Controllers\Agent\DealController::class, 'update'])->name('agents.deals.update');
//Route::put('/agents/deal/{id}/$', [DealController::class, 'accept']);
Route::put('/agents/deal/{id}/{status}', [DealController::class, 'handleUpdate']);

Route::get('/agents/transaction', [\App\Http\Controllers\Agent\TransactionController::class, 'index']);

Route::get('/agents/trippings', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'index']);
Route::patch('/agents/trippings/{id}/accept', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'accept']);
Route::patch('/agents/trippings/{id}/decline', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'decline']);
Route::patch('/agents/trippings/{tripping}/reschedule', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'reschedule']);
Route::patch('/agents/trippings/{tripping}/complete', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'complete']);
Route::get('/agents/calendar', [\App\Http\Controllers\Agent\PropertyTrippingController::class, 'calendar']);

Route::get('/agents/feedback', [\App\Http\Controllers\Agent\AgentController::class, 'feedback']);


Route::get('/all-properties', [\App\Http\Controllers\Buyer\BuyerController::class, 'allProperties'])->name('all.properties');
Route::get('/all-properties/{property}', [\App\Http\Controllers\PropertyController::class, 'show']);

Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])
    ->middleware('auth')
    ->name('notifications.read');
//------------------------------------------buyer---------------------------------------------------

Route::middleware(['auth'])->group(function () {
    Route::post('/property-listings/{propertyListing}/deals', [DealController::class, 'store'])->name('property-listings.deals.store');
    Route::put('/property-listings/{propertyListing}/deals/{deal}', [DealController::class, 'update'])->name('property-listings.deals.update');
});


Route::middleware(['auth','role:Buyer' ])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Buyer\BuyerController::class, 'index'])->name('dashboard');
    Route::post('/properties/{id}', [\App\Http\Controllers\Buyer\InquiryController::class, 'store']);
    Route::get('/inquiries', [\App\Http\Controllers\Buyer\InquiryController::class, 'index']);
    Route::get('/inquiries/{inquiry}', [\App\Http\Controllers\Buyer\InquiryController::class, 'show']);
    Route::patch('/inquiries/{id}/cancel', [\App\Http\Controllers\Buyer\InquiryController::class, 'cancel']);
    Route::get('/chat', [\App\Http\Controllers\Buyer\ChatController::class, 'index'])->name('buyer.chat.index');
    Route::get('/chat/channels/{channel}', [\App\Http\Controllers\Buyer\ChannelController::class, 'show'])->name('buyer.chat.channels.show');
    Route::get('/trippings', [\App\Http\Controllers\Buyer\PropertyTrippingController::class, 'index']);
    Route::post('/trippings', [\App\Http\Controllers\Buyer\PropertyTrippingController::class, 'store']);
    Route::get('/favourites', [\App\Http\Controllers\Buyer\FavouriteController::class, 'index']);
    Route::post('/favourites', [\App\Http\Controllers\Buyer\FavouriteController::class, 'store']);
    Route::put('/deal/{id}/{status}', [DealController::class, 'handleUpdate']);
    Route::get('/deals', [DealController::class, 'index']);
    Route::put('/deals/{deal}', [DealController::class, 'update'])->name('deal.deals.update');
    Route::get('/transactions', [\App\Http\Controllers\Buyer\TransactionController::class, 'index']);
    Route::get('/deals/{deal}/feedback', [FeedbackController::class, 'create'])->name('deals.feedback.create');
    Route::post('/deals/{deal}/feedback', [FeedbackController::class, 'store'])->name('deals.feedback.store');
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
Route::patch('/broker/deals/{deal}/{status}', [\App\Http\Controllers\Broker\DealController::class, 'update'])->name('broker.deals.update');
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
//    Route::post('/post-property', [PropertyController::class, 'store'])->name('post-property');

    Route::get('/all-agents', [\App\Http\Controllers\Agent\AgentController::class, 'loadAgents'])->name('get-all-agents');
});


Route::get('/maps', [\App\Http\Controllers\Property\PropertyController::class, 'map']);
Route::get('/maps/property/{id}', [\App\Http\Controllers\Property\PropertyController::class, 'map_show']);
Route::get('/agents/{agent}', [\App\Http\Controllers\Agent\AgentController::class, 'show']);
Route::get('properties/{property}', [\App\Http\Controllers\PropertyController::class, 'show']);
Route::post('/properties/{id}/favorites', [\App\Http\Controllers\Property\PropertyController::class, 'favourite'])->name('properties.favourite');

//
//Route::middleware(['auth'])->group(function () {
//    Route::get('/admin/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'index'])->name('admin.dashboard');
//    Route::get('/admin/properties', [\App\Http\Controllers\Admin\PropertyController::class, 'index'])->name('admin.properties');
//
//    Route::get('/admin/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users');
//    Route::get('/admin/users/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('admin.users.create');
//    Route::post('/admin/users/create', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
//    Route::get('/admin/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
//    Route::patch('/admin/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
//    Route::delete('/admin/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
//});






require __DIR__.'/auth.php';
