<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Pull latest notifications (adjust limit kung gusto mo)
        $all = $user->notifications()
            ->latest()
            ->take(50)
            ->get();

        $unread = $user->unreadNotifications()->get();

        return response()->json([
            'success' => true,
            'all'     => $all,
            'unread'  => $unread,
            'counts'  => [
                'all'    => $all->count(),
                'unread' => $unread->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, $notificationId)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        /** @var DatabaseNotification|null $notification */
        $notification = $user->notifications()
            ->where('id', $notificationId)
            ->first();

        if (! $notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        if (is_null($notification->read_at)) {
            $notification->markAsRead();
        }

        return response()->json([
            'success'      => true,
            'notification' => $notification->fresh(),
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
        ]);
    }

    public function markPageRead(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $url = $request->input('url'); // galing sa hook

        $query = $user->unreadNotifications();

        // Optional filter: if you store page URL inside notification data
        // e.g. ['url' => '/buyer/deals'] or full href
        if ($url) {
            $query->where('data->url', $url);
        }

        $query->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
        ]);
    }
}
