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
        return ['mail', 'database', 'broadcast'];;
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
        $inquiry = $this->inquiry;

        // Determine who the receiver is
        if ($inquiry->buyer && $notifiable->id === $inquiry->buyer->id) {
            $receiverRole = 'buyers';
        } elseif ($inquiry->seller && $notifiable->id === $inquiry->seller->id) {
            $receiverRole = 'sellers';
        } elseif ($inquiry->agent && $notifiable->id === $inquiry->agent->id) {
            $receiverRole = 'agents';
        } else {
            $receiverRole = null; // fallback case
        }

        // Build the path based on role
        $path = $receiverRole ? "/{$receiverRole}/inquiries/{$inquiry->id}" : "/inquiries/{$inquiry->id}";

        // Determine actor (the one who made the inquiry)
        $actor = $inquiry->buyer ?: $inquiry->agent;

        return [
            'title' => 'New Inquiry',
            'inquiry_id' => $inquiry->id,
            'message' => "You have received a new inquiry from {$actor->name}.",
            'link' => $path,
        ];
    }

    public function toBroadcast($notifiable): array
    {
        $inquiry = $this->inquiry;

        // Determine who the receiver is
        if ($inquiry->buyer && $notifiable->id === $inquiry->buyer->id) {
            $receiverRole = 'buyers';
        } elseif ($inquiry->seller && $notifiable->id === $inquiry->seller->id) {
            $receiverRole = 'sellers';
        } elseif ($inquiry->agent && $notifiable->id === $inquiry->agent->id) {
            $receiverRole = 'agents';
        } else {
            $receiverRole = null; // fallback case
        }

        // Build the path based on role
        $path = $receiverRole ? "/{$receiverRole}/inquiries" : "/inquiries";

        // Determine actor (the one who made the inquiry)
        $actor = $inquiry->buyer ?: $inquiry->agent;

        return [
            'title' => 'New Inquiry',
            'inquiry_id' => $inquiry->id,
            'message' => "You have received a new inquiry from {$actor->name}.",
            'link' => $path,
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
