<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'error'   => 'User not authenticated',
                    'success' => false,
                ], 401);
            }

            Log::info('Fetching notifications for user', [
                'user_id'   => $user->id,
                'user_name' => $user->name,
            ]);

            $allNotifications    = collect([]);
            $unreadNotifications = collect([]);

            try {
                $allNotifications    = $user->notifications()->latest()->get();
                $unreadNotifications = $user->unreadNotifications()->latest()->get();
            } catch (\Exception $e) {
                Log::error('Error fetching notifications', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                    'trace'   => $e->getTraceAsString(),
                ]);

                return response()->json([
                    'error'   => 'Error fetching notifications: ' . $e->getMessage(),
                    'success' => false,
                ], 500);
            }

            Log::info('Notifications fetched successfully', [
                'all_count'    => $allNotifications->count(),
                'unread_count' => $unreadNotifications->count(),
            ]);

            return response()->json([
                'success' => true,
                'all'     => $allNotifications->map([$this, 'formatNotification']),
                'unread'  => $unreadNotifications->map([$this, 'formatNotification']),
                'counts'  => [
                    'unread' => $unreadNotifications->count(),
                    'total'  => $allNotifications->count(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Unexpected error in NotificationController', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error'   => 'Server error: ' . $e->getMessage(),
                'success' => false,
            ], 500);
        }
    }

    public function formatNotification($notification)
    {
        try {
            return [
                'id'         => $notification->id,
                'type'       => $notification->type,
                'data'       => $notification->data,
                'read_at'    => $notification->read_at,
                'created_at' => $notification->created_at ? $notification->created_at->toISOString() : null,
                'updated_at' => $notification->updated_at ? $notification->updated_at->toISOString() : null,
            ];
        } catch (\Exception $e) {
            Log::error('Error formatting notification', [
                'notification_id' => $notification->id ?? 'unknown',
                'error'           => $e->getMessage(),
            ]);

            return [
                'id'         => $notification->id ?? 'unknown',
                'type'       => $notification->type ?? 'unknown',
                'data'       => $notification->data ?? [],
                'read_at'    => $notification->read_at ?? null,
                'created_at' => null,
                'updated_at' => null,
                'error'      => 'Formatting error',
            ];
        }
    }

    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $notification = $user->notifications()->where('id', $id)->first();

        if ($notification) {
            $notification->markAsRead();

            return response()->json([
                'success'      => true,
                'message'      => 'Notification marked as read',
                'notification' => $this->formatNotification($notification),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Notification not found',
        ], 404);
    }

    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $user->unreadNotifications->markAsRead();

        // If this is for web:
        // return back()->with('success', 'All notifications marked as read.');

        // If this is for API:
        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    public function markPageNotificationsAsRead(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $currentUrl = $request->path();

        // Map URLs to notification types
        $urlMappings = [
            'messages'     => [
                \App\Notifications\InquiryResponse::class,
                \App\Notifications\MessageNotification::class,
            ],
            'inquiries'    => [
                \App\Notifications\InquiryResponse::class,
            ],
            'trippings'    => [
                \App\Notifications\TrippingResponse::class,
            ],
            'deals'        => [
                \App\Notifications\DealResponse::class,
            ],
            'transactions' => [
                \App\Notifications\TransactionNotification::class,
            ],
        ];

        foreach ($urlMappings as $urlSegment => $notificationTypes) {
            if (str_contains($currentUrl, $urlSegment)) {
                $user->unreadNotifications()
                    ->whereIn('type', $notificationTypes)
                    ->update(['read_at' => now()]); // <-- ito yung kulang
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Page notifications marked as read',
        ]);
    }
}
