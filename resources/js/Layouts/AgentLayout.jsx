import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlignLeft, LogOut, X, Bell, Info, Ban, CheckCircle2 } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import { useMediaQuery } from "react-responsive";
import Dropdown from "@/Components/Dropdown";
import Breadcrumb from "@/Components/Breadcrumbs";
import FlashMessage from "@/Components/FlashMessage.jsx";
import Drawer from "@/Components/Drawer.jsx";
import AgentSidebar from "@/Components/Sidebar/AgentSidebar.jsx";

/* ================================
   Helpers (normalize + icon map)
=================================== */
function normalizeNotif(n) {
    return {
        id: n?.id,
        title: n?.data?.title ?? n?.title ?? "Notification",
        message: n?.data?.message ?? n?.message ?? "",
        link: n?.data?.link ?? n?.link ?? "",
        created_at: n?.data?.created_at ?? n?.created_at ?? "",
        read_at: n?.read_at ?? null,
    };
}

function iconFor(title) {
    const t = (title || "").toLowerCase();
    if (t.includes("rejected")) return { Icon: Ban, bg: "bg-red-100", fg: "text-red-600" };
    if (t.includes("assigned") || t.includes("close a deal"))
        return { Icon: CheckCircle2, bg: "bg-green-100", fg: "text-green-600" };
    // property posted, inquiry, tripping request, offer, deal counter, etc.
    return { Icon: Info, bg: "bg-blue-100", fg: "text-blue-600" };
}

/* Render one notification item */
function NotificationItem({ raw, onClickView, onMarkRead, clickable = true }) {
    const n = normalizeNotif(raw);
    const { Icon, bg, fg } = iconFor(n.title);

    return (
        <li
            key={n.id}
            className={`rounded-md transition group ${
                n.read_at === null ? "bg-gray-100 hover:bg-gray-200" : "bg-white hover:bg-gray-50"
            }`}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`shrink-0 p-2 rounded-full ${bg}`}>
                        <Icon className={`${fg} w-4 h-4`} aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                            <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                            <span className="text-xs text-gray-500 shrink-0">{n.created_at}</span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">{n.message}</p>

                        <div className="mt-2 flex justify-end gap-3">
                            {n.link && (
                                <Link
                                    href={n.link}
                                    className="text-blue-600 hover:underline text-sm"
                                    onClick={(e) => {
                                        // Allow parent to handle side-effects if needed
                                        onClickView?.(n);
                                    }}
                                >
                                    View
                                </Link>
                            )}
                            {onMarkRead && (
                                <button
                                    type="button"
                                    onClick={() => onMarkRead(n.id)}
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                    </div>

                    {n.read_at === null && (
                        <span className="ml-2 text-[10px] font-semibold text-white bg-rose-500 px-1.5 py-0.5 rounded">
              New
            </span>
                    )}
                </div>
            </div>
        </li>
    );
}

/* ================================
   Layout
=================================== */
export default function AgentLayout({ children }) {
    const { auth } = usePage().props;

    // SSR-safe localStorage read
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === "undefined") return false;
        try {
            const saved = window.localStorage.getItem("sidebar-isOpen");
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem("sidebar-isOpen", JSON.stringify(isOpen));
            } catch {}
        }
    }, [isOpen]);

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    useEffect(() => {
        if (!isMobile) setIsMobileOpen(false);
    }, [isMobile]);

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.body.style.overflow = isMobileOpen ? "hidden" : "";
        }
    }, [isMobileOpen]);

    /* Notifications */
    const [notifications, setNotifications] = useState(auth?.notifications?.all ?? []);
    const [unreadNotifications, setUnreadNotifications] = useState(auth?.notifications?.unread ?? []);
    const [openDrawer, setOpenDrawer] = useState(false);

    const markAsRead = useCallback((id) => {
        if (!id) return;
        router.post(
            `/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUnreadNotifications((prev) => prev.filter((n) => n.id !== id));
                    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
                },
                onError: (err) => console.error("Error marking notification as read:", err),
            }
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        // Simple forEach; for large volumes consider a bulk endpoint
        unreadNotifications.forEach((n) => markAsRead(n.id));
    }, [unreadNotifications, markAsRead]);

    // Echo guard for client-only environments
    useEffect(() => {
        const userId = auth?.user?.id;
        if (!userId || typeof window === "undefined" || typeof window.Echo === "undefined") return;

        const channel = `App.Models.User.${userId}`;
        try {
            window.Echo.private(channel).notification((notification) => {
                // Prepend new notification
                setNotifications((prev) => [notification, ...prev]);
                setUnreadNotifications((prev) => [notification, ...prev]);
            });
        } catch {}

        return () => {
            try {
                window.Echo.leave(channel);
            } catch {}
        };
    }, [auth?.user?.id]);

    /* Derived lists */
    const listUnread = unreadNotifications;
    const listAll = notifications;

    return (
        <div className="h-screen flex overflow-hidden relative bg-white">
            {/* Sidebar (Desktop) */}
            {!isMobile && (
                <div className="hidden md:block">
                    <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
            )}

            {/* Sidebar (Mobile Drawer) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="fixed top-0 left-0 z-[900] w-64 h-full bg-white shadow-2xl border-r rounded-tr-2xl rounded-br-2xl"
                            role="dialog"
                            aria-label="Mobile navigation"
                        >
                            <AgentSidebar isOpen={true} setIsOpen={setIsMobileOpen} />
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800"
                                aria-label="Close sidebar"
                                type="button"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>

                        <motion.button
                            type="button"
                            className="fixed inset-0 z-[800] bg-black/30 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsMobileOpen(false)}
                            aria-label="Close sidebar overlay"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Main */}
            <main className="flex-1 h-full overflow-auto pt-14">
                {/* Header */}
                <motion.header
                    initial={false}
                    animate={{ marginLeft: isMobile ? 0 : isOpen ? "18rem" : "5rem" }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-3 z-[500]"
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (isMobile) setIsMobileOpen(true);
                                else setIsOpen((s) => !s);
                            }}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition"
                            aria-label="Toggle sidebar"
                            type="button"
                        >
                            <AlignLeft size={20} className="text-gray-600" />
                        </button>

                        <input
                            type="search"
                            id="search_all"
                            placeholder="Search anything..."
                            className="hidden md:block ml-3 w-72 border-0 bg-gray-100 rounded-md px-3 py-2 text-sm"
                            aria-label="Search"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-3">
                            {/* Language */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="hover:bg-gray-100 p-2 rounded-full transition" role="button" aria-label="Change language">
                                        <img
                                            loading="lazy"
                                            alt="English"
                                            className="w-6 h-6"
                                            src="https://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg"
                                        />
                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="48">
                                    <ul className="py-1 px-2 text-sm text-gray-700">
                                        <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">English</li>
                                        <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">Filipino</li>
                                    </ul>
                                </Dropdown.Content>
                            </Dropdown>

                            {/* Notifications Button */}
                            <button
                                type="button"
                                onClick={() => setOpenDrawer(true)}
                                className="relative w-10 h-10 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                                aria-label="Open notifications"
                            >
                                <Bell className="w-6 h-6 text-gray-700" />
                                {listUnread.length > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {listUnread.length}
                  </span>
                                )}
                            </button>
                        </div>

                        {/* Profile */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition"
                                    role="button"
                                    aria-label="Open profile menu"
                                >
                                    <img
                                        src={
                                            auth?.user?.avatar_url ||
                                            "https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png"
                                        }
                                        alt="Profile"
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-200"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png";
                                        }}
                                    />
                                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {auth?.user?.name || "Account"}
                  </span>
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </Dropdown.Trigger>
                            <Dropdown.Content width="48">
                                <Dropdown.Link href={route("profile.edit")} className="px-4 py-2 hover:bg-gray-100">
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                                >
                                    <span>Log Out</span>
                                    <LogOut size={18} className="text-gray-500" />
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </motion.header>

                {/* Content */}
                <div className="pt-0 pb-4 md:pt-14 sm:p-6 lg:p-8">
                    <FlashMessage />
                    <Breadcrumb />
                    {children}
                </div>
            </main>

            {/* Notifications Drawer */}
            <Drawer title="Notifications" setOpen={setOpenDrawer} open={openDrawer}>
                <div className="py-4 space-y-6 max-h-[75vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline" type="button">
                            Mark all as read
                        </button>
                    </div>

                    {/* Unread */}
                    {listUnread.length > 0 && (
                        <section>
                            <h3 className="text-md font-semibold mb-2 text-gray-800">Unread</h3>
                            <ul className="space-y-2">
                                {listUnread.map((raw) => (
                                    <NotificationItem
                                        key={raw.id}
                                        raw={raw}
                                        onClickView={(n) => {
                                            if (!raw.read_at) markAsRead(n.id);
                                        }}
                                        onMarkRead={markAsRead}
                                    />
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* All */}
                    <section>
                        <h3 className="text-md font-semibold mb-2 text-gray-800">All Notifications</h3>
                        {listAll.length === 0 ? (
                            <p className="text-gray-500 text-sm">You have no notifications.</p>
                        ) : (
                            <ul className="space-y-2">
                                {listAll.map((raw) => (
                                    <NotificationItem
                                        key={raw.id}
                                        raw={raw}
                                        onClickView={(n) => {
                                            if (!raw.read_at) markAsRead(n.id);
                                        }}
                                        onMarkRead={raw.read_at ? undefined : markAsRead}
                                    />
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </Drawer>
        </div>
    );
}
