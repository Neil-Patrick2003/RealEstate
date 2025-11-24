import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
    AlignLeft,
    LogOut,
    X,
    Moon,
    Sun,
    Search,
    Bell,
    Info,
    Settings,
    User,
    Home,
    Heart,
    MessageSquare,
    FileText,
    CreditCard,
    HelpCircle,
    Zap,
    Sparkles,
    CheckCircle
} from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import BuyerSidebar from "@/Components/Sidebar/BuyerSidebar.jsx";
import ToastHandler from "@/Components/ToastHandler.jsx";
import Drawer from "@/Components/Drawer.jsx";
import { buildSidebarCounts } from "@/utils/sidebarCounts.js";
import FeedbackReminder from "@/Components/reminder/FeedbackReminder.jsx";
import Sidebar from "@/Components/Layout/Sidebar.jsx";
import {
    agentSidebarConfig,
    brokerSidebarConfig,
    buyerSidebarConfig,
    sellerSidebarConfig
} from "@/Components/Layout/SidebarConfigs.js";
import { useNotification } from "../../hooks/useNotifications.js";

/* ================================
   Design Constants & Utils
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
        } catch { }
    },
};

const isEditableTarget = (el) =>
    el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable;

const getLayoutMode = () => {
    if (!canUseDOM) return "desktop";
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
};

/* =========================================================
   Enhanced Command Palette
========================================================= */
function CommandPalette({ open, setOpen, actions }) {
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        if (!open) {
            setQuery("");
            setActiveIndex(0);
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = ""; };
        }
    }, [open]);

    const filteredActions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return actions;
        return actions.filter(
            (a) =>
                a.label.toLowerCase().includes(q) ||
                (a.keywords || "").toLowerCase().includes(q) ||
                (a.category || "").toLowerCase().includes(q)
        );
    }, [query, actions]);

    useEffect(() => {
        setActiveIndex(0);
    }, [filteredActions.length]);

    const executeAction = useCallback((action) => {
        if (action.href) {
            router.visit(action.href);
        } else {
            action.onClick?.();
        }
        setOpen(false);
    }, [setOpen]);

    const handleKeyDown = (e) => {
        switch (e.key) {
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredActions.length);
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
                break;
            case "Enter":
                e.preventDefault();
                if (filteredActions[activeIndex]) {
                    executeAction(filteredActions[activeIndex]);
                }
                break;
        }
    };

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
        }
    }, [open]);

    // Scroll active item into view
    useEffect(() => {
        const activeEl = listRef.current?.children[activeIndex];
        if (activeEl) {
            activeEl.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed z-[91] left-1/2 top-[10vh] w-[95vw] max-w-2xl -translate-x-1/2 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-2xl overflow-hidden"
                        role="dialog"
                        aria-label="Command palette"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 p-4 border-b border-amber-100 dark:border-amber-900">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-xl">
                                <Search className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a command or search..."
                                className="flex-1 bg-transparent outline-none text-lg placeholder-amber-400 dark:placeholder-amber-600 text-gray-900 dark:text-white"
                                aria-label="Command search"
                            />
                            <div className="flex items-center gap-2 text-sm text-amber-500 dark:text-amber-400">
                                <kbd className="px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-md text-xs">ESC</kbd>
                                <span>to close</span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto" ref={listRef}>
                            {filteredActions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Search className="w-12 h-12 text-amber-300 dark:text-amber-700 mb-4" />
                                    <p className="text-amber-500 dark:text-amber-400 text-lg">No results found</p>
                                    <p className="text-amber-400 dark:text-amber-500 text-sm mt-1">Try a different search term</p>
                                </div>
                            ) : (
                                <ul className="py-2" role="listbox">
                                    {filteredActions.map((action, index) => {
                                        const Icon = action.icon || Zap;
                                        return (
                                            <li
                                                key={action.label}
                                                id={`cmd-${index}`}
                                                role="option"
                                                aria-selected={index === activeIndex}
                                            >
                                                {action.href ? (
                                                    <Link
                                                        href={action.href}
                                                        className={`flex items-center gap-4 p-4 transition-all ${index === activeIndex
                                                            ? 'bg-amber-50 dark:bg-amber-900/50 border-r-2 border-amber-500 dark:border-amber-400'
                                                            : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                        }`}
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <div className={`p-2 rounded-lg ${index === activeIndex
                                                            ? 'bg-amber-500 dark:bg-amber-400 text-white'
                                                            : 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300'
                                                        }`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                                                            {action.description && (
                                                                <p className="text-sm text-amber-500 dark:text-amber-400 mt-1">{action.description}</p>
                                                            )}
                                                        </div>
                                                        {action.kbd && (
                                                            <kbd className="px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs text-amber-500 dark:text-amber-300 font-mono">
                                                                {action.kbd}
                                                            </kbd>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={() => executeAction(action)}
                                                        className={`w-full flex items-center gap-4 p-4 text-left transition-all ${index === activeIndex
                                                            ? 'bg-amber-50 dark:bg-amber-900/50 border-r-2 border-amber-500 dark:border-amber-400'
                                                            : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                        }`}
                                                    >
                                                        <div className={`p-2 rounded-lg ${index === activeIndex
                                                            ? 'bg-amber-500 dark:bg-amber-400 text-white'
                                                            : 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300'
                                                        }`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                                                            {action.description && (
                                                                <p className="text-sm text-amber-500 dark:text-amber-400 mt-1">{action.description}</p>
                                                            )}
                                                        </div>
                                                        {action.kbd && (
                                                            <kbd className="px-2 py-1 bg-amber-100 dark:bg-amber-800 rounded text-xs text-amber-500 dark:text-amber-300 font-mono">
                                                                {action.kbd}
                                                            </kbd>
                                                        )}
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/20">
                            <div className="flex items-center justify-between text-xs text-amber-500 dark:text-amber-400">
                                <span>Quickly access anything in the platform</span>
                                <div className="flex items-center gap-4">
                                    <span>↑↓ to navigate</span>
                                    <span>↵ to select</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/* ================================
   Enhanced Notification Item
=================================== */
function NotificationItem({ notification, onMarkRead, isUnread }) {
    const { data = {}, created_at, type = 'info' } = notification;

    const title =
        data.title ??
        notification.title ??
        "Notification";

    const message =
        data.message ??
        data.body ??
        notification.message ??
        "";

    const link =
        data.link ??
        data.url ??
        data.route ??
        notification.link ??
        null;

    const getIcon = () => {
        const t = String(type).toLowerCase();
        if (t.includes('tripping')) return '🏠';
        if (t.includes('inquiry')) return '💬';
        if (t.includes('deal')) return '🤝';
        if (t.includes('transaction')) return '💰';
        return '💡';
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "Recently";
        const date = new Date(timestamp);
        const now = new Date();
        const diff = (now - date) / (1000 * 60 * 60);

        if (diff < 1) return "Just now";
        if (diff < 24) return `${Math.floor(diff)}h ago`;

        return date.toLocaleDateString();
    };

    const handleClick = () => {
        if (isUnread) onMarkRead(notification.id);
        if (link) {
            router.visit(link);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border cursor-pointer transition-all group ${isUnread
                ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            }`}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`p-2 rounded-lg ${isUnread
                        ? "bg-amber-500 dark:bg-amber-400 text-white"
                        : "bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300"
                    }`}
                >
                    <span>{getIcon()}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                        <h4
                            className={`font-medium ${isUnread
                                ? "text-amber-900 dark:text-amber-100"
                                : "text-gray-900 dark:text-white"
                            }`}
                        >
                            {title}
                        </h4>
                        <span className="text-xs text-amber-500 dark:text-amber-400">
                            {formatTime(created_at)}
                        </span>
                    </div>

                    <p className="text-sm text-amber-600 dark:text-amber-300 mt-1 line-clamp-2">
                        {message}
                    </p>

                    {isUnread && (
                        <button
                            className="opacity-0 group-hover:opacity-100 mt-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkRead(notification.id);
                            }}
                        >
                            Mark as read
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ================================
   Main Layout
=================================== */
export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const prefersReducedMotion = useReducedMotion();

    /* -------- State Management -------- */
    const [theme, setTheme] = useState(() => {
        if (!canUseDOM) return "light";
        return safeLS.get("theme",
            window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        );
    });

    const [mode, setMode] = useState(getLayoutMode());
    const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
        mode === "desktop" ? safeLS.get("sidebar-isOpen", true) : false
    );
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCommandOpen, setIsCommandOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [activeNotifTab, setActiveNotifTab] = useState("unread");

    const getSidebarConfig = () => {
        const role = auth?.user?.role?.toLowerCase();

        switch (role) {
            case 'admin':
                return adminSidebarConfig;
            case 'agent':
                return agentSidebarConfig;
            case 'broker':
                return brokerSidebarConfig;
            case 'seller':
                return sellerSidebarConfig;
            case 'buyer':
            default:
                return buyerSidebarConfig;
        }
    };

    const sidebarConfig = getSidebarConfig();

    const {
        notifications,
        unreadNotifications,
        loading,
        markAsRead,
        markAllAsRead,
    } = useNotification();

    /* -------- Effects -------- */
    useEffect(() => {
        if (!canUseDOM) return;
        document.documentElement.classList.toggle("dark", theme === "dark");
        safeLS.set("theme", theme);
    }, [theme]);

    useEffect(() => {
        if (!canUseDOM) return;
        const handleResize = () => setMode(getLayoutMode());
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (mode === "desktop") {
            safeLS.set("sidebar-isOpen", isSidebarOpen);
        }
    }, [isSidebarOpen, mode]);

    /* -------- Handlers -------- */
    const toggleTheme = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

    const toggleSidebar = useCallback(() => {
        if (mode === "mobile") {
            setIsMobileSidebarOpen(prev => {
                const next = !prev;
                if (next) {
                    setIsSidebarOpen(true);
                }
                return next;
            });
        } else {
            setIsSidebarOpen(s => !s);
        }
    }, [mode]);

    const closeMobileSidebar = useCallback(() => {
        setIsMobileSidebarOpen(false);
    }, []);

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        router.get("/search", { q }, { preserveScroll: true });
    }, [searchQuery]);

    const handleMarkAsRead = (notificationId) => {
        markAsRead(notificationId);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    /* -------- Command Palette Actions -------- */
    const commandActions = useMemo(() => [
        {
            label: "Search Properties",
            href: "/properties",
            icon: Search,
            kbd: "⌘P",
            keywords: "find browse listings",
            category: "Navigation"
        },
        {
            label: "View Notifications",
            onClick: () => setIsNotificationsOpen(true),
            icon: Bell,
            kbd: "⌘N",
            keywords: "alerts messages",
            category: "Navigation"
        },
        {
            label: "My Favorites",
            href: "/favorites",
            icon: Heart,
            keywords: "saved liked properties",
            category: "Properties"
        },
        {
            label: "My Inquiries",
            href: "/inquiries",
            icon: MessageSquare,
            keywords: "messages contacts agents",
            category: "Communication"
        },
        {
            label: "Transactions",
            href: "/buyer/transactions",
            icon: CreditCard,
            keywords: "payments deals closed",
            category: "Transactions"
        },
        {
            label: "Profile Settings",
            href: "/profile",
            icon: User,
            keywords: "account preferences",
            category: "Account"
        },
        {
            label: "Toggle Theme",
            onClick: toggleTheme,
            icon: theme === "dark" ? Sun : Moon,
            kbd: "⌘T",
            keywords: "dark light mode",
            category: "Preferences"
        }
    ], [toggleTheme, theme]);

    /* -------- Keyboard Shortcuts -------- */
    useEffect(() => {
        const handleKeyDown = (e) => {
            const cmd = e.metaKey || e.ctrlKey;

            if (cmd && e.key === 'k') {
                e.preventDefault();
                setIsCommandOpen(true);
            }
            if (cmd && e.key === 'n') {
                e.preventDefault();
                setIsNotificationsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsCommandOpen(false);
                setIsNotificationsOpen(false);
                setIsMobileSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    /* -------- Layout Calculations -------- */
    const sidebarWidth = isSidebarOpen ? 288 : 80;
    const contentPadding = mode === "mobile" ? 24 : sidebarWidth + 24;

    return (
        <div className="page-container dark:bg-gray-900">
            {/* Desktop Sidebar */}
            {mode !== "mobile" && (
                <div className="hidden md:block">
                    <Sidebar
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        config={sidebarConfig}
                        counts={{ unread: unreadNotifications.length }}
                        unreads={unreadNotifications}
                        user={auth.user}
                        onNavigate={closeMobileSidebar}
                    />
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mode === "mobile" && isMobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/30"
                            onClick={closeMobileSidebar}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-gray-900 border-r border-amber-200 dark:border-amber-800 shadow-2xl"
                        >
                            <Sidebar
                                isOpen={true}
                                setIsOpen={() => { }}
                                config={sidebarConfig}
                                counts={{ unread: unreadNotifications.length }}
                                unreads={unreadNotifications}
                                user={auth.user}
                                onNavigate={closeMobileSidebar}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Enhanced Header */}
                <motion.header
                    initial={false}
                    animate={{ paddingLeft: mode === "mobile" ? 0 : sidebarWidth }}
                    className="page-header glass dark:glass-dark fixed top-0 left-0 right-0 z-30"
                >
                    <div className="flex items-center justify-between px-6 py-4">
                        {/* Left Section */}
                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={toggleSidebar}
                                className="btn-ghost p-2.5 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                aria-label={mode === "mobile" ? "Toggle menu" : "Toggle sidebar"}
                            >
                                <AlignLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </button>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 dark:text-amber-600" />
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search properties, agents, or anything..."
                                        className="form-input pl-10 pr-20 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400"
                                        aria-label="Search"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsCommandOpen(true)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-amber-500 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                    >
                                        ⌘K
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="btn-ghost p-2.5 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? (
                                    <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                )}
                            </button>

                            {/* Notifications */}
                            <button
                                onClick={() => setIsNotificationsOpen(true)}
                                className="btn-ghost p-2.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 relative"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                {unreadNotifications.length > 0 && (
                                    <span className="badge bg-amber-500 dark:bg-amber-400 text-white absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full animate-pulse">
                                        {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 cursor-pointer">
                                        {auth?.user?.photo_url ? (
                                            <img
                                                src={`/storage/${auth.user.photo_url}`}
                                                alt={auth.user.name}
                                                className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-200 dark:ring-amber-700"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full gradient-amber text-white flex items-center justify-center ring-2 ring-amber-200 dark:ring-amber-700">
                                                {auth?.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="hidden sm:block text-left">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {auth?.user?.name}
                                            </p>
                                            <p className="text-xs text-amber-500 dark:text-amber-400">
                                                {auth?.user?.role} Account
                                            </p>
                                        </div>
                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="48" className="z-40">
                                    <Dropdown.Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Profile & Settings</span>
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Log Out</span>
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </motion.header>

                {/* Content Area */}
                <motion.div
                    initial={false}
                    animate={{
                        paddingLeft: contentPadding,
                        paddingRight: 24
                    }}
                    className="bg-[#f5f7fb]  pt-24 pb-8 overflow-auto"
                >
                    <ToastHandler />
                    <FeedbackReminder items={usePage().props.pendingFeedback || []} />
                    {children}
                </motion.div>
            </main>

            {/* Command Palette */}
            <CommandPalette
                open={isCommandOpen}
                setOpen={setIsCommandOpen}
                actions={commandActions}
            />

            {/* Notifications Drawer */}
            <Drawer
                id="notifications-drawer"
                title="Notifications"
                open={isNotificationsOpen}
                setOpen={setIsNotificationsOpen}
                className="z-40"
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="card-header border-b border-amber-100 dark:border-amber-900">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title text-amber-900 dark:text-amber-100">
                                Notifications
                            </h2>
                            {unreadNotifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 p-1 bg-amber-100 dark:bg-amber-900 rounded-lg">
                            {[
                                { id: "unread", label: `Unread (${unreadNotifications.length})` },
                                { id: "all", label: `All (${notifications.length})` }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveNotifTab(tab.id)}
                                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeNotifTab === tab.id
                                        ? 'bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 shadow-sm'
                                        : 'text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-3">
                            {(activeNotifTab === "unread" ? unreadNotifications : notifications).map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkRead={handleMarkAsRead}
                                    isUnread={!notification.read_at}
                                />
                            ))}

                            {((activeNotifTab === "unread" ? unreadNotifications : notifications).length === 0) && (
                                <div className="text-center py-12">
                                    <Bell className="w-12 h-12 text-amber-300 dark:text-amber-700 mx-auto mb-4" />
                                    <p className="text-amber-500 dark:text-amber-400 text-lg">No notifications</p>
                                    <p className="text-amber-400 dark:text-amber-500 text-sm mt-1">
                                        {activeNotifTab === "unread" ? "You're all caught up!" : "No notifications yet"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
