<?php

namespace App\Notifications;

use App\Models\PropertyTripping;
use App\Notifications\Channels\SmsChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IncomingTripping extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public PropertyTripping $tripping)
    {
        $this->tripping->load('property');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', SmsChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('Property Tripping Reminder')
            ->line("You have scheduled a tripping later at ". $this->tripping->visit_time . " on " . $this->tripping->property->title);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }

    public function toSms($notifiable): string
    {
        return "TRIPPING REMINDER: You have scheduled a tripping later at ". $this->tripping->visit_time . " on " . $this->tripping->property->title;
    }
}
