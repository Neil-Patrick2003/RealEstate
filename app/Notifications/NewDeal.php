<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewDeal extends Notification
{
    use Queueable;

    public $data;
    /**
     * Create a new notification instance.
     */
    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
//    public function toMail(object $notifiable): MailMessage
//    {
//        return (new MailMessage)
//            ->line('The introduction to the notification.')
//            ->action('Notification Action', url('/'))
//            ->line('Thank you for using our application!');
//    }

     public function toDatabase($notifiable): array
      {
          return [
              'title' => 'Offer a Deal',
              'message' => "{$this->data['buyer_name']} has offered an amount of {$this->data['amount']} for '{$this->data['property_title']}'",
              'link' => '/agents/deal'
          ];
      }

      public function toBroadcast($notifiable): array
      {
          return [
              'title' => 'Offer a Deal',
              'message' => "{$this->data['buyer_name']} has offered an amount of {$this->data['amount']} for '{$this->data['property_title']}'",
              'link' => '/agents/deal'
          ];
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
}
