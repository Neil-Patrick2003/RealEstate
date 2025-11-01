<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Laravel\Sanctum\HasApiTokens;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function property()
    {
        return $this->hasMany(Property::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class, 'seller_id');
    }



    public function buyerInquiriesAsAgent()
    {
        return $this->hasMany(Inquiry::class, 'buyer_id')
            ->where('agent_id', auth()->id());
    }

    public function sellerInquiriesAsAgent()
    {
        return $this->hasMany(Inquiry::class, 'seller_id')
            ->where('agent_id', auth()->id());
    }

    public function messages(){
        return $this->hasMany(Message::class);
    }

    public function listing(){
        return $this->hasMany(PropertyListing::class, 'agent_id');
    }

    public function favourites(){
        return $this->hasMany(Favourite::class);
    }

    public function agent_trippings(){
        return $this->hasMany(PropertyTripping::class, 'agent_id');
    }

    public function buyer_trippings()
    {
      return $this->hasMany(PropertyTripping::class , 'buyer_id');
    }

    public function inquiriesAsBuyer()
    {
        return $this->hasMany(Inquiry::class, 'buyer_id');
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class, 'sender_id');
    }

    public function feedbackAsReceiver(): User|\Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Feedback::class, 'agent_id');
    }

    public function develop()
    {
        return $this->hasOne(Developer::class, 'user_id');
    }

    public function property_listings()
    {
        return $this->belongsToMany(
            PropertyListing::class,
            'property_listing_agents',
            'agent_id',
            'property_listing_id');


    }



    public function broker_listing(){
        return $this->hasMany(PropertyListing::class, 'broker_id');

    }

    public function feedbackReceived()
    {
        return $this->hasMany(Feedback::class, 'agent_id');
    }

    public function deals()
    {
        return $this->hasMany(Deal::class, 'agent_id');
    }

    public function dealsViaListings()
    {
        return $this->hasManyThrough(
            \App\Models\Deal::class,            // final
            \App\Models\PropertyListing::class, // through
            'broker_id',                        // listings.broker_id -> users.id
            'property_listing_id',              // deals.property_listing_id -> listings.id
            'id',                               // users.id
            'id'                                // listings.id
        );
    }

    public function listingsAsBroker()
    {
        return $this->hasMany(\App\Models\PropertyListing::class, 'broker_id');
    }

    public function broker() { return $this->belongsTo(User::class, 'broker_id'); }


    public function active_listings()
    {
        return $this->hasMany(\App\Models\PropertyListing::class, 'agent_id')
            ->where('status', 'Published');
    }

    public function averageFeedback(): Attribute
    {
        return Attribute::get(function () {
            // SQL average (fast) — returns null if no rows
            $avg = $this->feedbackAsReceiver()
                ->selectRaw('(
                AVG(communication) +
                AVG(negotiation) +
                AVG(professionalism) +
                AVG(knowledge)
            ) / 4 as overall')
                ->value('overall');

            return round((float) ($avg ?? 0), 2);
        });
    }


    public function propertiesHandled()
    {
        return $this->belongsToMany(\App\Models\Property::class, 'property_listings', 'user_id', 'property_id')
            ->withTimestamps();
    }

    public function listingAssignments()
    {
        return $this->belongsToMany(\App\Models\PropertyListing::class, 'property_listing_agents', 'agent_id', 'property_listing_id')
            ->withTimestamps();
    }

    public function routeNotificationForSms(): ?string
    {
        return $this->contact_number;
    }
    public function canAccessPanel(Panel $panel): bool
    {
        return true;
    }


}
