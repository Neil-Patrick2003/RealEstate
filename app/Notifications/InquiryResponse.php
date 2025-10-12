<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InquiryResponse extends Notification
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

          // Set title dynamically based on status
          $title = $status === 'Accepted'
              ? 'Inquiry Accepted'
              : 'Inquiry Rejected';

          return [
              'title' => $title,
              'message' => "{$this->data['seller_name']} {$status} your inquiry for '{$this->data['property_title']}'",
              'link' => $this->data['link'] ?? null,
          ];
      }

      public function toBroadcast($notifiable): array
      {
          $status = $this->data['status'];

          // Set title dynamically based on status
          $title = $status === 'Accepted'
              ? 'New Assigned Property'
              : 'Inquiry Rejected';

          return [
              'title' => $title,
              'message' => "{$this->data['seller_name']} {$status} your inquiry for '{$this->data['property_title']}'",
              'link' => $this->data['link'] ?? null,
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
