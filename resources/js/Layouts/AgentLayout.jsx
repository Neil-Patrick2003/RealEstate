import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlignLeft, LogOut, X, Bell, Info, Ban, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react"; // Added new icons
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

// Updated iconFor to include more meaningful types (using Blue/Amber as secondary/primary)
function iconFor(title) {
    const t = (title || "").toLowerCase();

    // Success/Positive Actions (Green)
    if (t.includes("assigned") || t.includes("booked") || t.includes("success"))
        return { Icon: CheckCircle2, bg: "bg-green-100", fg: "text-green-600" };

    // Negative/Rejected/Cancelled (Red)
    if (t.includes("rejected") || t.includes("cancelled") || t.includes("failed"))
        return { Icon: Ban, bg: "bg-red-100", fg: "text-red-600" };

    // Warnings/Urgent/Pending (Amber) - Aligns with Primary Theme
    if (t.includes("pending") || t.includes("urgent") || t.includes("reminder") || t.includes("offer"))
        return { Icon: AlertTriangle, bg: "bg-amber-100", fg: "text-amber-600" };

    // Inquiries/Messages (Blue) - System actions
    if (t.includes("inquiry") || t.includes("message"))
        return { Icon: MessageSquare, bg: "bg-blue-100", fg: "text-blue-600" };

    // Default/General Info (Gray/Neutral)
    return { Icon: Info, bg: "bg-gray-100", fg: "text-gray-600" };
}

function normalizeNotif(n) {
    // Ensuring consistent data structure from API
    const data = n?.data || {};
    return {
        id: n?.id,
        title: data?.title ?? n?.title ?? "System Alert",
        message: data?.message ?? n?.message ?? "",
        link: data?.link ?? n?.link ?? "",
        created_at: data?.created_at ?? n?.created_at ?? new Date().toISOString().slice(0, 10), // Use ISO format for parsing
        read_at: n?.read_at ?? null,
    };
}

/* Render one notification item */
function NotificationItem({ raw, onClickView, onMarkRead }) {
    const n = normalizeNotif(raw);
    const { Icon, bg, fg } = iconFor(n.title);

    // Format date nicely
    const date = new Date(n.created_at);
    const timeAgo = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <li
            key={n.id}
            className={`rounded-xl transition shadow-sm ${
                // Use a subtle difference between read/unread backgrounds
                n.read_at === null ? "bg-white hover:bg-gray-100 ring-1 ring-amber-100" : "bg-gray-50 hover:bg-gray-100"
            }`}
        >
            <div className="p-4 flex items-start gap-4">
                {/* Icon Circle */}
                <div className={`shrink-0 p-3 rounded-full ${bg}`}>
                    <Icon className={`${fg} w-5 h-5`} aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3 items-center">
                        <p className={`text-base font-semibold truncate ${n.read_at === null ? "text-gray-900" : "text-gray-700"}`}>
                            {n.title}
                        </p>
                        <span className="text-xs text-gray-500 shrink-0">{timeAgo}</span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>

                    <div className="mt-3 flex justify-end gap-4">
                        {n.link && (
                            <Link
                                href={n.link}
                                // Secondary color for links (Blue)
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition"
                                onClick={(e) => {
                                    // Mark as read when viewing the link
                                    onClickView?.(n);
                                }}
                            >
                                View Details
                            </Link>
                        )}
                        {n.read_at === null && onMarkRead && (
                            <button
                                type="button"
                                onClick={() => onMarkRead(n.id)}
                                // Subtle gray button
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm transition"
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
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

    // --- Sidebar State & Logic ---
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
    const isMobile = useMediaQuery({ query: "(max-width: 1000px)" });

    useEffect(() => {
        if (!isMobile) setIsMobileOpen(false);
    }, [isMobile]);

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.body.style.overflow = isMobileOpen ? "hidden" : "";
        }
    }, [isMobileOpen]);

    // --- Notifications State & Logic ---
    const [notifications, setNotifications] = useState(auth?.notifications?.all ?? []);
    const [unreadNotifications, setUnreadNotifications] = useState(auth?.notifications?.unread ?? []);
    const [openDrawer, setOpenDrawer] = useState(false);

    const markAsRead = useCallback((id) => {
        if (!id) return;
        router.post(
            route('notifications.read', id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUnreadNotifications((prev) => prev.filter((n) => n.id !== id));
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
                    );
                },
                onError: (err) => console.error("Error marking notification as read:", err),
            }
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        // Use a dedicated bulk endpoint if available, or fallback to sequential marking
        router.post(
            route('notifications.read.all'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUnreadNotifications([]);
                    setNotifications((prev) =>
                        prev.map((n) => (n.read_at === null ? { ...n, read_at: new Date().toISOString() } : n))
                    );
                },
                onError: (err) => {
                    console.error("Error marking all as read, falling back to sequential:", err);
                    unreadNotifications.forEach((n) => markAsRead(n.id));
                },
            }
        );
    }, [markAsRead, unreadNotifications]);

    // Real-time Echo integration
    useEffect(() => {
        const userId = auth?.user?.id;
        if (!userId || typeof window === "undefined" || typeof window.Echo === "undefined") return;

        const channel = `App.Models.User.${userId}`;
        try {
            window.Echo.private(channel).notification((notification) => {
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

    // --- Layout structure ---
    const sidebarWidth = isMobile ? "0px" : isOpen ? "18rem" : "5rem";

    return (
        <div className="h-screen flex overflow-hidden relative bg-gray-50">
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
                        {/* Mobile Sidebar Panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="fixed top-0 left-0 z-[900] w-64 h-full bg-white shadow-2xl border-r"
                            role="dialog"
                            aria-label="Mobile navigation"
                        >
                            <AgentSidebar isOpen={true} setIsOpen={setIsMobileOpen} />
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-600 hover:bg-gray-50 rounded-full transition"
                                aria-label="Close sidebar"
                                type="button"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>

                        {/* Backdrop */}
                        <motion.button
                            type="button"
                            className="fixed inset-0 z-[800] bg-black/50 backdrop-blur-sm"
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

            {/* Main Content Area */}
            <div
                className="flex-1 h-full overflow-auto pt-[100px]" // Fixed pt for consistent header height
                // style={{ marginLeft: isMobile ? 0 : sidebarWidth }} // Use margin to push content
            >
                {/* Header (Fixed and Animated) */}
                <motion.header
                    initial={false}
                    // Animation simplified to just use the CSS variable based margin set on the main div
                    // We removed the animation on the header itself to prevent reflow issues
                    className="fixed top-0 right-0 flex justify-between items-center bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-3 z-[500] w-full"
                    style={{
                        width: `calc(100% - ${sidebarWidth})`, // Calculate width dynamically
                        transition: "width 0.28s ease-in-out", // Animate width change
                    }}
                >
                    <div className="flex items-center gap-4">
                        {/* Sidebar Toggle Button */}
                        <button
                            onClick={() => {
                                if (isMobile) setIsMobileOpen(true);
                                else setIsOpen((s) => !s);
                            }}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition"
                            aria-label="Toggle sidebar"
                            type="button"
                        >
                            <AlignLeft size={20} />
                        </button>

                        {/* Search Bar - Modern, focus on blue ring */}
                        <input
                            type="search"
                            id="search_all"
                            placeholder="Search properties, clients, reports..."
                            className="hidden md:block w-72 border-0 bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-700
                                       focus:ring-2 focus:ring-blue-300 focus:bg-white transition"
                            aria-label="Search"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                            {/* Language (Secondary Color Ring) */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="hover:bg-gray-100 p-2 rounded-full transition ring-2 ring-transparent hover:ring-blue-100" role="button" aria-label="Change language">
                                        <img
                                            loading="lazy"
                                            alt="English"
                                            className="w-6 h-6 rounded-full"
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

                            {/* Notifications Button (Primary Color for Alert) */}
                            <button
                                type="button"
                                onClick={() => setOpenDrawer(true)}
                                className="relative w-10 h-10 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                                aria-label="Open notifications"
                            >
                                <Bell className="w-6 h-6 text-gray-700" />
                                {listUnread.length > 0 && (
                                    <span className="absolute top-1 right-1 bg-amber-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                                        {listUnread.length > 9 ? '9+' : listUnread.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Profile Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 pr-2 py-1 rounded-full transition"
                                    role="button"
                                    aria-label="Open profile menu"
                                >
                                    <img
                                        src={
                                            auth?.user?.avatar_url ||
                                            "https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png"
                                        }
                                        alt="Profile"
                                        // Blue ring for interactive focus
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-300"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png";
                                        }}
                                    />
                                    <span className="hidden lg:inline text-sm font-semibold text-gray-800">
                                        {auth?.user?.name?.split(' ')[0] || "Account"} {/* Use first name for brevity */}
                                    </span>
                                    <svg className="w-4 h-4 text-gray-500 hidden sm:inline" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </Dropdown.Trigger>
                            <Dropdown.Content width="48">
                                <Dropdown.Link href={route("profile.edit")} className="px-4 py-2 hover:bg-gray-100 text-gray-700">
                                    Your Profile
                                </Dropdown.Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <Dropdown.Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="flex items-center justify-between px-4 py-2 text-red-600 hover:bg-red-50"
                                >
                                    <span>Log Out</span>
                                    <LogOut size={18} />
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </motion.header>

                {/* Content */}
                <div className="pb-8 px-6">
                    <FlashMessage />
                    <Breadcrumb />
                    {children}
                </div>
            </div>

            {/* Notifications Drawer (Improved Styling) */}
            <Drawer title="Notifications" setOpen={setOpenDrawer} open={openDrawer}>
                <div className="py-4 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto"> {/* Adjusted max-height */}

                    {/* Mark All As Read Button - Secondary Blue theme */}
                    <div className="flex justify-end">
                        <button
                            onClick={markAllAsRead}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                            type="button"
                        >
                            Mark all as read
                        </button>
                    </div>

                    {/* Unread Section */}
                    {listUnread.length > 0 && (
                        <section className="border-t border-gray-100 pt-4">
                            <h3 className="text-lg font-bold mb-3 text-gray-800">New ({listUnread.length})</h3>
                            <ul className="space-y-3">
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

                    {/* All Notifications Section */}
                    <section className={`${listUnread.length > 0 ? 'border-t border-gray-100 pt-4' : ''}`}>
                        <h3 className="text-lg font-bold mb-3 text-gray-800">History</h3>
                        {listAll.length === 0 ? (
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                                <p className="text-gray-500 text-sm mt-2">You're all caught up!</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
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
