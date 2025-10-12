<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrippingResponse extends Notification
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
          $status = $this->data['status'];

          $title = $status === 'accepted'
              ? 'Tripping Visit Scheduled'
              : 'Scheduled Tripping Visit Rejected';

          return [
              'title' => $title,
              'message' => "{$this->data['agent_name']} {$this->data['status']} your tripping request for '{$this->data['property_title']}'",
          ];
      }
      public function toBroadcast($notifiable): array
      {
          $status = $this->data['status'];

          $title = $status === 'accepted'
              ? 'Tripping Visit Scheduled'
              : 'Scheduled Tripping Visit Rejected';

          return [
              'title' => $title,
              'message' => "{$this->data['agent_name']} {$this->data['status']} your tripping request for '{$this->data['property_title']}'",
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
