// resources/js/Layouts/BuyerLayout.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { AlignLeft, LogOut, X, Moon, Sun, Search, Bell, Info } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import BuyerSidebar from "@/Components/Sidebar/BuyerSidebar.jsx";
import ToastHandler from "@/Components/ToastHandler.jsx";
import Drawer from "@/Components/Drawer.jsx";
import { buildSidebarCounts } from "@/utils/sidebarCounts.js";
import FeedbackReminder from "@/Components/reminder/FeedbackReminder.jsx";

/* ================================
   Small Utils
=================================== */
const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";

const safeLS = {
    get(key, fallback = null) {
        if (!canUseDOM) return fallback;
        try {
            const raw = window.localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch {
            return fallback;
        }
    },
    set(key, val) {
        if (!canUseDOM) return;
        try {
            window.localStorage.setItem(key, JSON.stringify(val));
        } catch {}
    },
};

const isEditableTarget = (el) =>
    el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable;

/* Breakpoint helper (mobile/tablet/desktop) */
const getLayoutMode = () => {
    if (!canUseDOM) return "desktop";
    const w = window.innerWidth;
    if (w < 768) return "mobile";       // < md
    if (w < 1024) return "tablet";      // md only
    return "desktop";                   // lg+
};

/* =========================================================
   Command Palette (⌘/Ctrl+K) — with keyboard navigation
========================================================= */
function CommandPalette({ open, setOpen, actions }) {
    const [q, setQ] = useState("");
    const [active, setActive] = useState(0);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) {
            setQ("");
            setActive(0);
        }
    }, [open]);

    // lock body scroll while open
    useEffect(() => {
        if (!canUseDOM) return;
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => (document.body.style.overflow = prev);
        }
    }, [open]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return actions;
        return actions.filter(
            (a) =>
                a.label.toLowerCase().includes(query) ||
                (a.keywords || "").toLowerCase().includes(query)
        );
    }, [q, actions]);

    useEffect(() => {
        setActive((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
    }, [filtered.length]);

    const perform = useCallback(
        (item) => {
            if (!item) return;
            if (item.href) {
                setOpen(false);
            } else {
                item.onClick?.();
                setOpen(false);
            }
        },
        [setOpen]
    );

    const onKeyDown = (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            return;
        }
        if (!filtered.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % filtered.length);
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + filtered.length) % filtered.length);
        }
        if (e.key === "Enter") {
            e.preventDefault();
            perform(filtered[active]);
        }
    };

    useEffect(() => {
        if (!open) return;
        inputRef.current?.focus();
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* overlay stays above header */}
                    <motion.button
                        aria-label="Close command palette"
                        className="fixed inset-0 z-[90] bg-black/30"
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Command palette"
                        className="fixed z-[91] left-1/2 top-[12vh] w-[92vw] max-w-xl -translate-x-1/2 rounded-2xl border border-gray-200 bg-white shadow-xl"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        onKeyDown={onKeyDown}
                    >
                        <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
                            <Search className="w-4 h-4 text-gray-500" />
                            <input
                                ref={inputRef}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Type a command…"
                                className="w-full bg-transparent outline-none text-sm py-2"
                                aria-label="Command search"
                            />
                            <button
                                className="p-2 rounded-md hover:bg-gray-100"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto p-1" ref={listRef}>
                            {filtered.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-gray-500">No commands found.</div>
                            ) : (
                                <ul className="py-1" role="listbox" aria-activedescendant={`cmd-${active}`}>
                                    {filtered.map((a, idx) => {
                                        const common = (
                                            <>
                                                <span className="text-sm text-gray-800">{a.label}</span>
                                                {a.kbd && (
                                                    <span className="ml-3 text-[11px] text-gray-500 border rounded px-1.5 py-0.5">
                            {a.kbd}
                          </span>
                                                )}
                                            </>
                                        );
                                        const cls =
                                            "flex items-center justify-between px-3 py-2 rounded-md " +
                                            (idx === active ? "bg-gray-100" : "hover:bg-gray-50");
                                        return (
                                            <li id={`cmd-${idx}`} key={idx} role="option" aria-selected={idx === active}>
                                                {a.href ? (
                                                    <Link href={a.href} className={cls} onClick={() => setOpen(false)}>
                                                        {common}
                                                    </Link>
                                                ) : (
                                                    <button type="button" onClick={() => perform(a)} className={`w-full ${cls}`}>
                                                        {common}
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ================================
   Main Layout
=================================== */
export default function BuyerLayout({ children }) {
    const { auth } = usePage().props;
    const prefersReducedMotion = useReducedMotion();

    /* -------- Theme (light/dark) -------- */
    const [theme, setTheme] = useState(() => {
        if (!canUseDOM) return "light";
        return safeLS.get(
            "theme",
            window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        );
    });
    useEffect(() => {
        if (!canUseDOM) return;
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        safeLS.set("theme", theme);
    }, [theme]);
    const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

    /* -------- Responsive layout mode -------- */
    const [mode, setMode] = useState(getLayoutMode()); // "mobile" | "tablet" | "desktop"
    useEffect(() => {
        if (!canUseDOM) return;
        let raf = 0;
        const onResize = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setMode(getLayoutMode()));
        };
        window.addEventListener("resize", onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    /* -------- Sidebar state --------
       Desktop: persistent (remember open/collapsed)
       Tablet: collapsed by default (icon-only); toggles inline
       Mobile: off-canvas drawer
    --------------------------------- */
    const SIDEBAR_OPEN = 288;     // 18rem
    const SIDEBAR_COLLAPSED = 80; // 5rem
    const CONTENT_PAD = 24;

    const [isOpen, setIsOpen] = useState(() => {
        const saved = safeLS.get("sidebar-isOpen", true);
        // tablet default collapsed, mobile drawer (irrelevant), desktop saved
        if (mode === "tablet") return false;
        if (mode === "desktop") return !!saved;
        return false;
    });

    // keep isOpen in sync when mode changes
    useEffect(() => {
        if (mode === "desktop") {
            setIsOpen((prev) => safeLS.get("sidebar-isOpen", typeof prev === "boolean" ? prev : true));
        } else if (mode === "tablet") {
            setIsOpen(false);
        } else {
            // mobile
            setIsOpen(false);
        }
    }, [mode]);

    useEffect(() => {
        if (mode === "desktop") safeLS.set("sidebar-isOpen", isOpen);
    }, [isOpen, mode]);

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const toggleSidebar = () => {
        if (mode === "mobile") setIsMobileOpen((s) => !s);        // drawer
        else setIsOpen((s) => !s);                                 // inline collapse/expand
    };

    /* -------- Global search (header) -------- */
    const [search, setSearch] = useState("");
    const submitSearch = useCallback(() => {
        const q = search.trim();
        if (!q) return;
        router.get("/search", { q }, { preserveScroll: true });
    }, [search]);

    /* -------- Notifications -------- */
    const [notifications, setNotifications] = useState(auth?.notifications?.all ?? []);
    const [unreadNotifications, setUnreadNotifications] = useState(auth?.notifications?.unread ?? []);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [notifTab, setNotifTab] = useState("unread"); // 'unread' | 'all'

    const markAsRead = useCallback((id) => {
        if (!id) return;
        router.post(
            `/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUnreadNotifications((prev) => prev.filter((n) => n.id !== id));
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
                    );
                },
                onError: (error) => console.error("Error marking notification as read:", error),
            }
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        if (!unreadNotifications.length) return;
        router.post(
            `/notifications/read-all`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
                    setUnreadNotifications([]);
                },
                onError: () => {
                    unreadNotifications.forEach((n) => markAsRead(n.id));
                },
            }
        );
    }, [unreadNotifications, markAsRead]);

    // Realtime notifications (guard Echo presence)
    useEffect(() => {
        if (!auth?.user?.id || !canUseDOM) return;
        const channelName = `App.Models.User.${auth.user.id}`;
        try {
            if (typeof Echo !== "undefined" && Echo?.private) {
                const ch = Echo.private(channelName).notification((notification) => {
                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadNotifications((prev) => [notification, ...prev]);
                });
                return () => {
                    try {
                        ch?.stopListening?.();
                        Echo.leave(channelName);
                    } catch {}
                };
            }
        } catch {}
    }, [auth?.user?.id]);

    /* -------- Layout paddings based on mode -------- */
    const sidebarOffset =
        mode === "mobile" ? 0 : isOpen ? SIDEBAR_OPEN : SIDEBAR_COLLAPSED;
    const contentLeft = mode === "mobile" ? CONTENT_PAD : sidebarOffset + CONTENT_PAD;

    const headerTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeInOut" };

    /* -------- Command Palette -------- */
    const [paletteOpen, setPaletteOpen] = useState(false);
    const actions = useMemo(
        () => [
            { label: "Open Notifications", onClick: () => setOpenDrawer(true), kbd: "N", keywords: "alerts messages" },
            { label: "Toggle Theme", onClick: toggleTheme, keywords: "dark light mode appearance" },
            { label: "Go to Inquiries", href: "/inquiries", keywords: "contact agent leads" },
            { label: "Go to Transactions", href: "/buyer/transactions", keywords: "closed deals payments" },
            { label: "Profile Settings", href: "/profile", keywords: "account user profile" },
            { label: "Search…", onClick: () => document.getElementById("search_all")?.focus(), kbd: "⌘/Ctrl + K", keywords: "find query" },
        ],
        [toggleTheme]
    );

    /* -------- Keyboard Shortcuts -------- */
    useEffect(() => {
        const onKey = (e) => {
            const cmdOrCtrl = e.metaKey || e.ctrlKey;
            if (cmdOrCtrl && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setPaletteOpen(true);
                return;
            }
            if (e.key.toLowerCase() === "n" && !isEditableTarget(e.target)) {
                setOpenDrawer(true);
                return;
            }
            if (e.key === "Escape") {
                setPaletteOpen(false);
                setOpenDrawer(false);
                setIsMobileOpen(false);
                return;
            }
            if (e.key === "Enter" && document.activeElement?.id === "search_all") {
                e.preventDefault();
                submitSearch();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [submitSearch]);

    /* -------- Notification helpers -------- */
    const notifTitle = (n) => n?.data?.title ?? n?.title ?? "Notification";
    const notifMsg = (n) => n?.data?.message ?? n?.message ?? "";
    const notifLink = (n) => n?.data?.link ?? n?.link ?? "";
    const notifTime = (n) => n?.data?.created_at ?? n?.created_at ?? "";

    const listUnread = unreadNotifications;
    const listAll = notifications;

    // Scroll lock when overlays are open (mobile sidebar or notifications)
    useEffect(() => {
        if (!canUseDOM) return;
        const anyOverlayOpen = (mode === "mobile" && isMobileOpen) || openDrawer;
        if (anyOverlayOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isMobileOpen, openDrawer, mode]);

    const counts = buildSidebarCounts(unreadNotifications);
    const { pendingFeedback = [] } = usePage().props;

    return (
        <div className="h-screen bg-white dark:bg-slate-900 flex overflow-hidden relative">
            {/* Sidebar: Desktop & Tablet inline */}
            {mode !== "mobile" && (
                <div className="hidden md:block">
                    <BuyerSidebar isOpen={isOpen} setIsOpen={setIsOpen} counts={counts} />
                </div>
            )}

            {/* Sidebar: Mobile off-canvas */}
            <AnimatePresence initial={false}>
                {mode === "mobile" && isMobileOpen && (
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
                        className="fixed top-0 left-0 z-50 w-64 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation"
                    >
                        <BuyerSidebar isOpen={true} setIsOpen={setIsMobileOpen} counts={counts} />
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop for mobile drawer */}
            {mode === "mobile" && isMobileOpen && (
                <button
                    className="fixed inset-0 z-40 bg-black/30"
                    onClick={() => setIsMobileOpen(false)}
                    aria-label="Close sidebar overlay"
                />
            )}

            {/* Main */}
            <main className="w-full h-full overflow-auto bg-gray-50">
                {/* Header */}
                <motion.header
                    initial={false}
                    animate={{ paddingLeft: mode === "mobile" ? 0 : sidebarOffset }}
                    transition={headerTransition}
                    className="fixed top-0 left-0 right-0 z-[70] bg-white/85 dark:bg-slate-900/85 backdrop-blur border-b border-gray-100 dark:border-slate-800 supports-[backdrop-filter]:backdrop-blur-md"
                >
                    <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                                aria-label={
                                    mode === "mobile"
                                        ? isMobileOpen ? "Close menu" : "Open menu"
                                        : isOpen ? "Collapse sidebar" : "Expand sidebar"
                                }
                                title={
                                    mode === "mobile"
                                        ? isMobileOpen ? "Close menu" : "Open menu"
                                        : isOpen ? "Collapse sidebar" : "Expand sidebar"
                                }
                            >
                                <AlignLeft size={20} className="text-gray-700 dark:text-slate-200" />
                            </button>

                            {/* Desktop search */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitSearch();
                                }}
                                className="relative hidden md:flex items-center"
                            >
                                <Search className="w-4 h-4 text-gray-500 absolute left-3" />
                                <input
                                    type="search"
                                    id="search_all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search anything…"
                                    className="ml-3 w-80 pl-8 border-0 bg-gray-100 dark:bg-slate-800 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700"
                                    aria-label="Search anything"
                                />
                            </form>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                                aria-label="Toggle theme"
                                title="Toggle theme"
                            >
                                {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                            </button>

                            {/* Language */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div
                                        className="hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-full transition"
                                        role="button"
                                        aria-label="Change language"
                                    >
                                        <img
                                            loading="lazy"
                                            alt="English"
                                            className="w-6 h-6"
                                            src="https://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg"
                                        />
                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="48" className="z-[75]">
                                    <ul className="py-1 px-2 text-sm text-gray-700 dark:text-slate-200">
                                        <li className="hover:bg-gray-100 dark:hover:bg-slate-800 rounded px-2 py-1 cursor-pointer">English</li>
                                        <li className="hover:bg-gray-100 dark:hover:bg-slate-800 rounded px-2 py-1 cursor-pointer">Filipino</li>
                                    </ul>
                                </Dropdown.Content>
                            </Dropdown>

                            {/* Notifications */}
                            <button
                                onClick={() => {
                                    setOpenDrawer(true);
                                    setNotifTab("unread");
                                }}
                                className="relative w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition flex items-center justify-center"
                                aria-label="Open notifications"
                                aria-haspopup="dialog"
                            >
                                <Bell className="w-6 h-6 text-gray-700 dark:text-slate-200" />
                                <span
                                    className={`${
                                        unreadNotifications.length ? "flex" : "hidden"
                                    } absolute top-1 right-1 bg-red-500 text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full`}
                                    aria-live="polite"
                                >
                                  {unreadNotifications.length}
                                </span>
                            </button>

                            {/* Profile */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div
                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition"
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
                                            onError={(e) =>
                                                (e.currentTarget.src =
                                                    "https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png")
                                            }
                                        />
                                        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-slate-200 truncate max-w-[12ch]">
                      {auth?.user?.name ?? "Account"}
                    </span>
                                        <svg className="w-4 h-4 text-gray-500 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="48" className="z-[75]">
                                    <Dropdown.Link href="/profile" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
                                    >
                                        <span>Log Out</span>
                                        <LogOut size={18} className="text-gray-500" />
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </motion.header>

                {/* Content */}
                <motion.div
                    initial={false}
                    animate={{ paddingLeft: contentLeft, paddingRight: CONTENT_PAD }}
                    transition={headerTransition}
                    className="pt-20 pb-10 relative z-0"
                >
                    <ToastHandler />
                    <FeedbackReminder items={pendingFeedback} />
                    {children}
                </motion.div>
            </main>

            {/* Command Palette */}
            <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} actions={actions} />

            {/* Notifications Drawer — keep above header */}
            <Drawer
                id="notifications-drawer"
                title="Notifications"
                setOpen={setOpenDrawer}
                open={openDrawer}
                className="z-[80]"
            >
                <div className="py-4 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Tabs */}
                    <div className="flex items-center justify-between">
                        <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
                            <button
                                className={`px-3 py-1.5 text-sm ${
                                    notifTab === "unread" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => setNotifTab("unread")}
                            >
                                Unread ({listUnread.length})
                            </button>
                            <button
                                className={`px-3 py-1.5 text-sm ${
                                    notifTab === "all" ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => setNotifTab("all")}
                            >
                                All ({listAll.length})
                            </button>
                        </div>

                        {listUnread.length > 0 && (
                            <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Lists */}
                    {notifTab === "unread" ? (
                        listUnread.length === 0 ? (
                            <p className="text-gray-500 text-sm">No unread notifications.</p>
                        ) : (
                            <ul className="space-y-2">
                                {listUnread.map((notif) => (
                                    <li
                                        key={notif.id}
                                        className="rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            const l = notifLink(notif);
                                            if (l) router.visit(l);
                                        }}
                                        role="button"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="shrink-0 p-2 bg-blue-100 rounded-full" aria-hidden="true">
                                                    <Info className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between gap-3">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{notifTitle(notif)}</p>
                                                        <span className="text-xs text-gray-500 shrink-0">{notifTime(notif)}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{notifMsg(notif)}</p>
                                                    {notifLink(notif) && (
                                                        <div className="mt-2">
                                                            <Link href={notifLink(notif)} className="text-blue-600 hover:underline">
                                                                View
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="ml-2 text-[10px] font-semibold text-white bg-rose-500 px-1.5 py-0.5 rounded">
                          New
                        </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    ) : listAll.length === 0 ? (
                        <p className="text-gray-500 text-sm">You have no notifications.</p>
                    ) : (
                        <ul className="space-y-2">
                            {listAll.map((notif) => (
                                <li
                                    key={notif.id}
                                    className={`rounded-md cursor-pointer transition group ${
                                        notif.read_at === null ? "bg-gray-100 hover:bg-gray-200" : "bg-white hover:bg-gray-50"
                                    }`}
                                    onClick={() => {
                                        if (!notif.read_at) markAsRead(notif.id);
                                        const l = notifLink(notif);
                                        if (l) router.visit(l);
                                    }}
                                    role="button"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 p-2 bg-blue-100 rounded-full" aria-hidden="true">
                                                <Info className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between gap-3">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{notifTitle(notif)}</p>
                                                    <span className="text-xs text-gray-500 shrink-0">{notifTime(notif)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{notifMsg(notif)}</p>
                                                {notifLink(notif) && (
                                                    <div className="mt-2">
                                                        <Link href={notifLink(notif)} className="text-blue-600 hover:underline">
                                                            View
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                            {!notif.read_at && (
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 ml-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notif.id);
                                                    }}
                                                    aria-label="Mark as read"
                                                    title="Mark as read"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
