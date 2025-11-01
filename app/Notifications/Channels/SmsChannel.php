<?php

namespace App\Notifications\Channels;

use App\Services\Sms\SmsClient;
use Illuminate\Notifications\Notification;

class SmsChannel
{
    public function __construct(private SmsClient $sms) {}

    /**
     * @param  mixed  $notifiable
     * @param  Notification  $notification
     */
    public function send($notifiable, $notification): void
    {
        $to = $notifiable->routeNotificationFor('sms');
        if (!$to) return;

        $message = method_exists($notification, 'toSms')
            ? $notification->toSms($notifiable)
            : null;

        if (!is_string($message) || $message === '') return;

        $this->sms->send($to, $message);
    }
}
