<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'contact_number',
        'address',
        'bio',
        'photo_url',
        'broker_id'

    ];

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

    public function develops()
    {
        return $this->hasOne(Developer::class, 'user_id');
    }

    public function property_listings()
    {
        return $this->belongsToMany(PropertyListing::class, 'property_listing_agents', 'agent_id', 'property_listing_id');
    }


    public function broker_listing(){
        return $this->hasMany(PropertyListing::class, 'broker_id');

    }

    public function feedbackReceived()
    {
        return $this->hasMany(Feedback::class, 'agent_id');
    }




}
