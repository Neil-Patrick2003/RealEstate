<?php

namespace App\Notifications;

use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMatchingPropertyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Property $property)
    {

    }

    public function via(object $notifiable): array
    {

        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New property similar to your last purchase')
            ->line('We found a new property similar to the one you recently bought.')
            ->line($this->property->title ?? 'New matching property')
            ->action('View property', url('/properties/' . $this->property->slug))
            ->line('Thank you for using MJVI Realty!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'property_id'   => $this->property->id,
            'title'         => $this->property->title,
            'property_type' => $this->property->property_type,
            'sub_type'      => $this->property->sub_type,
            'price'         => $this->property->price,
            'url'           => url('/properties/' . $this->property->id),
            'message'       => 'New property similar to your last purchase.',
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'property_id'   => $this->property->id,
            'title'         => $this->property->title,
            'property_type' => $this->property->property_type,
            'sub_type'      => $this->property->sub_type,
            'price'         => $this->property->price,
            'url'           => url('/properties/' . $this->property->id),
            'message'       => 'New property similar to your last purchase.',
        ];
    }


}
