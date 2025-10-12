<?php

namespace App\Providers;

use App\Models\Deal;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);



        Inertia::share('pendingFeedback', function () {
            $user = Auth::user();
            if (!$user) return [];

            // Normalize "closed" states you consider eligible for feedback
            $closedStatuses = [
                'closed','sold','completed','finalized','done',
                'Closed','Sold','Completed','Finalized','Done',
                // add any other variants you use, e.g. "Closed with Deal"
            ];

            $deals = Deal::query()
                ->where('buyer_id', $user->id)
                ->whereIn('status', $closedStatuses)
                // current buyer has NOT yet left feedback for this deal
                ->whereDoesntHave('feedbacks', function ($q) use ($user) {
                    $q->where('sender_id', $user->id);
                })
                ->with([
                    // pull property + agent THROUGH the listing
                    'propertyListing.property:id,title,image_url',
                    'propertyListing.agent:id,name,photo_url',
                ])
                ->latest() // uses created_at
                // IMPORTANT: only select columns that actually exist on 'deals'
                ->get(['id','property_listing_id','buyer_id','status','updated_at','created_at'])
                ->take(5);

            return $deals->map(function ($d) {
                $listing  = $d->propertyListing;
                $property = optional($listing)->property;
                $agent    = optional($listing)->agent;

                return [
                    'id'         => $d->id,
                    'status'     => $d->status,
                    'updated_at' => optional($d->updated_at)->toIso8601String(),
                    'property'   => [
                        'title'     => $property?->title,
                        'image_url' => $property?->image_url,
                    ],
                    'agent'      => [
                        'id'        => $agent?->id,
                        'name'      => $agent?->name,
                        'photo_url' => $agent?->photo_url,
                    ],
                    'feedback_link' => route('deals.feedback.create', ['deal' => $d->id]),
                ];
            })->values();
        });
    }
}
