    // resources/js/Layouts/BuyerLayout.jsx
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
    import {agentSidebarConfig, buyerSidebarConfig, sellerSidebarConfig} from "@/Components/Layout/SidebarConfigs.js";
    import {useNotification} from "../../hooks/useNotifications.js";
    /* ================================
       Design Constants & Utils
    =================================== */
    const DESIGN = {
        colors: {
            primary: {
                50: '#f0fdf4',
                100: '#dcfce7',
                500: '#22c55e',
                600: '#16a34a',
                700: '#15803d',
                900: '#14532d',
            },
            neutral: {
                50: '#fafafa',
                100: '#f4f4f5',
                200: '#e4e4e7',
                300: '#d4d4d8',
                400: '#a1a1aa',
                500: '#71717a',
                600: '#52525b',
                700: '#3f3f46',
                800: '#27272a',
                900: '#18181b',
            }
        },
        shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        }
    };

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
                            className="fixed z-[91] left-1/2 top-[10vh] w-[95vw] max-w-2xl -translate-x-1/2 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
                            role="dialog"
                            aria-label="Command palette"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 p-4 border-b border-neutral-100">
                                <div className="p-2 bg-primary-100 rounded-xl">
                                    <Search className="w-5 h-5 text-primary-600" />
                                </div>
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a command or search..."
                                    className="flex-1 bg-transparent outline-none text-lg placeholder-neutral-400"
                                    aria-label="Command search"
                                />
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <kbd className="px-2 py-1 bg-neutral-100 rounded-md text-xs">ESC</kbd>
                                    <span>to close</span>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto" ref={listRef}>
                                {filteredActions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Search className="w-12 h-12 text-neutral-300 mb-4" />
                                        <p className="text-neutral-500 text-lg">No results found</p>
                                        <p className="text-neutral-400 text-sm mt-1">Try a different search term</p>
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
                                                                ? 'bg-primary-50 border-r-2 border-primary-500'
                                                                : 'hover:bg-neutral-50'
                                                            }`}
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            <div className={`p-2 rounded-lg ${index === activeIndex ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'
                                                            }`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-neutral-900">{action.label}</p>
                                                                {action.description && (
                                                                    <p className="text-sm text-neutral-500 mt-1">{action.description}</p>
                                                                )}
                                                            </div>
                                                            {action.kbd && (
                                                                <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs text-neutral-500 font-mono">
                                                                    {action.kbd}
                                                                </kbd>
                                                            )}
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={() => executeAction(action)}
                                                            className={`w-full flex items-center gap-4 p-4 text-left transition-all ${index === activeIndex
                                                                ? 'bg-primary-50 border-r-2 border-primary-500'
                                                                : 'hover:bg-neutral-50'
                                                            }`}
                                                        >
                                                            <div className={`p-2 rounded-lg ${index === activeIndex ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'
                                                            }`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-neutral-900">{action.label}</p>
                                                                {action.description && (
                                                                    <p className="text-sm text-neutral-500 mt-1">{action.description}</p>
                                                                )}
                                                            </div>
                                                            {action.kbd && (
                                                                <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs text-neutral-500 font-mono">
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
                            <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
                                <div className="flex items-center justify-between text-xs text-neutral-500">
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

        // FIXED — always read from the Laravel "data" object
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
                className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                    isUnread
                        ? "bg-primary-50 border-primary-200 hover:bg-primary-100"
                        : "bg-white border-neutral-200 hover:bg-neutral-50"
                }`}
                onClick={handleClick}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`p-2 rounded-lg ${
                            isUnread
                                ? "bg-primary-500 text-white"
                                : "bg-neutral-100 text-neutral-600"
                        }`}
                    >
                        <span>{getIcon()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                            <h4
                                className={`font-medium ${
                                    isUnread ? "text-primary-900" : "text-neutral-900"
                                }`}
                            >
                                {title}
                            </h4>
                            <span className="text-xs text-neutral-500">
                                {formatTime(created_at)}
                            </span>
                        </div>

                        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                            {message}
                        </p>

                        {isUnread && (
                            <button
                                className="opacity-0 group-hover:opacity-100 mt-2 text-xs text-primary-600"
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
    export default function BuyerLayout({ children }) {
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
                case 'broker':
                    return agentSidebarConfig;
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

        // Mark page notifications as read when page loads
        useEffect(() => {
            if (unreadNotifications.length > 0) {
                markPageNotificationsAsRead();
            }
        }, [usePage().url]);

        /* -------- Handlers -------- */
        const toggleTheme = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

        const toggleSidebar = useCallback(() => {
            if (mode === "mobile") {
                setIsMobileSidebarOpen(s => !s);
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
            <div className="h-screen bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 flex overflow-hidden">
                {/* Desktop Sidebar */}
                {mode !== "mobile" && (
                    <div className="hidden md:block">
                        <Sidebar
                            isOpen={isSidebarOpen}
                            setIsOpen={setIsSidebarOpen}
                            config={sidebarConfig}  // ← Use dynamic config
                            counts={{ unread: unreadNotifications.length }}
                            unreads={unreadNotifications}
                            user={auth.user}
                            onNavigate={closeMobileSidebar}
                        />
                    </div>
                )}

                {/* Mobile Sidebar Overlay - FIXED */}
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
                                className="fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 shadow-2xl"
                            >
                                <Sidebar
                                    isOpen={isSidebarOpen}
                                    setIsOpen={setIsSidebarOpen}
                                    config={sidebarConfig}  // ← Use dynamic config
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
                        className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-700/50 supports-[backdrop-filter]:bg-white/60"
                    >
                        <div className="flex items-center justify-between px-6 py-4">
                            {/* Left Section */}
                            <div className="flex items-center gap-4 flex-1">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 hover:shadow-md"
                                    aria-label={mode === "mobile" ? "Toggle menu" : "Toggle sidebar"}
                                >
                                    <AlignLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                                </button>

                                {/* Search Bar */}
                                <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <input
                                            type="search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search properties, agents, or anything..."
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl text-neutral-700 dark:text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-neutral-700 transition-all duration-200"
                                            aria-label="Search"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsCommandOpen(true)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-neutral-500 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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
                                    className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200"
                                    aria-label="Toggle theme"
                                >
                                    {theme === "dark" ? (
                                        <Sun className="w-5 h-5 text-amber-400" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-neutral-600" />
                                    )}
                                </button>

                                {/* Notifications */}
                                <button
                                    onClick={() => setIsNotificationsOpen(true)}
                                    className="relative p-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200"
                                    aria-label="Notifications"
                                >
                                    <Bell className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
                                    {unreadNotifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full animate-pulse">
                                            {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                                        </span>
                                    )}
                                </button>

                                {/* User Menu */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 cursor-pointer">
                                            {auth?.user?.photo_url ? (
                                                <img
                                                    src={auth.user.photo_url}
                                                    alt={auth.user.name}
                                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                                                />
                                            ) : (
                                                <div
                                                    className="w-8 h-8 rounded-full bg-gradient-to-l  from-primary to-accent text-white flex items-center justify-center ring-2 ring-primary-200 dark:ring-primary-800"
                                                >
                                                    {auth?.user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div className="hidden sm:block text-left">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                    {auth?.user?.name}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    Buyer Account
                                                </p>
                                            </div>
                                        </div>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content width="48" className="z-40">
                                        <Dropdown.Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Profile & Settings</span>
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-red-600 dark:text-red-400"
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
                        className="flex-1 pt-24 pb-8 overflow-auto"
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
                        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                    Notifications
                                </h2>
                                {unreadNotifications.length > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                {[
                                    { id: "unread", label: `Unread (${unreadNotifications.length})` },
                                    { id: "all", label: `All (${notifications.length})` }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveNotifTab(tab.id)}
                                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${activeNotifTab === tab.id
                                            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
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
                                        onMarkRead={handleMarkAsRead}  // This should point to markAsRead from useNotification
                                        isUnread={!notification.read_at}
                                    />
                                ))}

                                {(activeNotifTab === "unread" ? unreadNotifications : notifications).map(notification => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkRead={handleMarkAsRead}
                                        isUnread={!notification.read_at}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </Drawer>
            </div>
        );
    }
