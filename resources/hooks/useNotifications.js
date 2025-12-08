// resources/js/hooks/useNotification.js
import { useCallback, useState, useEffect } from 'react';

function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
}

// Defensive JSON parser (handles 204 / HTML error pages gracefully)
async function safeJson(response) {
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
        return null;
    }

    try {
        return await response.json();
    } catch (e) {
        console.warn('⚠️ Failed to parse JSON response', e);
        return null;
    }
}

export function useNotification() {
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch('/notifications', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.status === 401) {
                console.warn('⚠️ User not authenticated when fetching notifications');
                setNotifications([]);
                setUnreadNotifications([]);
                return;
            }

            if (!response.ok) {
                console.error('❌ Fetch notifications failed:', response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await safeJson(response) || {};

            // Expecting: { success, all: [...], unread: [...], counts: {...} }
            let allNotifications = [];
            let unreadNotifs = [];

            if (Array.isArray(data.all)) {
                allNotifications = data.all;
            } else if (Array.isArray(data)) {
                // fallback if API returns raw array
                allNotifications = data;
            }

            if (Array.isArray(data.unread)) {
                unreadNotifs = data.unread;
            } else {
                unreadNotifs = allNotifications.filter((notif) => !notif.read_at);
            }

            setNotifications(allNotifications);
            setUnreadNotifications(unreadNotifs);
        } catch (error) {
            console.error('❌ Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                console.error('❌ CSRF token not found in meta tag');
                return;
            }

            const response = await fetch(`/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({}),
            });

            if (response.status === 401) {
                console.warn('⚠️ User not authenticated when marking as read');
                return;
            }

            if (!response.ok) {
                console.error('❌ markAsRead response not ok:', response.status);
                throw new Error('Failed to mark as read');
            }

            const data = await safeJson(response);
            const readAt =
                data?.notification?.read_at || new Date().toISOString();

            // Optimistic update
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId
                        ? { ...notif, read_at: readAt }
                        : notif,
                ),
            );
            setUnreadNotifications((prev) =>
                prev.filter((notif) => notif.id !== notificationId),
            );
        } catch (error) {
            console.error('❌ Failed to mark notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                console.error('❌ CSRF token not found in meta tag');
                return;
            }

            const response = await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({}),
            });

            if (response.status === 401) {
                console.warn('⚠️ User not authenticated when marking all as read');
                return;
            }

            if (!response.ok) {
                console.error('❌ markAllAsRead response not ok:', response.status);
                throw new Error('Failed to mark all as read');
            }

            // no need to parse body; we only care about success
            const nowIso = new Date().toISOString();

            setNotifications((prev) =>
                prev.map((notif) => ({
                    ...notif,
                    read_at: notif.read_at || nowIso,
                })),
            );
            setUnreadNotifications([]);
        } catch (error) {
            console.error('❌ Failed to mark all notifications as read:', error);
        }
    }, []);

    const markPageNotificationsAsRead = useCallback(async () => {
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                console.error('❌ CSRF token not found in meta tag');
                return;
            }

            const response = await fetch('/notifications/mark-page-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    url: window.location.pathname, // or window.location.href, depende sa backend logic mo
                }),
            });

            if (response.status === 401) {
                console.warn(
                    '⚠️ User not authenticated when marking page notifications as read',
                );
                return;
            }

            if (!response.ok) {
                console.error(
                    '❌ markPageNotificationsAsRead response not ok:',
                    response.status,
                );
                throw new Error('Failed to mark page as read');
            }

            await safeJson(response);
            // Refresh from server so counts match backend logic (by URL mapping)
            fetchNotifications();
        } catch (error) {
            console.error(
                '❌ Failed to mark page notifications as read:',
                error,
            );
        }
    }, [fetchNotifications]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadNotifications,
        loading,
        markAsRead,
        markAllAsRead,
        markPageNotificationsAsRead,
        refreshNotifications: fetchNotifications,
    };
}
