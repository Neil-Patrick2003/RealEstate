<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\InteractsWithQueue;
use Inertia\Testing\Concerns\Interaction;

class NewInquiry extends Notification implements ShouldQueue
{
    use Queueable, InteractsWithQueue;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Inquiry $inquiry)
    {
        $this->inquiry->load('seller', 'buyer', 'agent');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $receiver = $this->inquiry->buyer ? $this->inquiry->agent : $this->inquiry->seller;
        $actor = $this->inquiry->buyer ? $this->inquiry->buyer : $this->inquiry->agent;

        return (new MailMessage)
            ->line("Hi $receiver->name!,")
            ->line("You have received a new inquiry from $actor->name.");
    }

    public function toDatabase(object $notifiable): array
    {
        $actor = $this->inquiry->buyer ? $this->inquiry->buyer : $this->inquiry->agent;

        return [
            'inquiry_id' => $this->inquiry->id,
            'message' => "You have received a new inquiry from $actor->name.",
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
