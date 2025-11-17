import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from '../../../assets/framer_logo.png';
import {
    ChevronDown,
    Home,
    Mail,
    CalendarDays,
    Star,
    MessageSquare,
    Handshake,
    BarChart3,
    Building,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    Plus,
    Users,
    FileText,
} from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";
import { createPortal } from "react-dom";

/* --------------------------------
   Enhanced utils
----------------------------------*/
const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined"
const classNames = (...c) => c.filter(Boolean).join(" ");
const fmtCount = (n) => n > 99 ? "99+" : n;

/* Enhanced Hover Tooltip */
const HoverTooltip = ({ show, label, children }) => {
    const ref = useRef(null);
    const [hovered, setHovered] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const place = useCallback(() => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: r.right + 8, y: r.top + r.height / 2 });
    }, []);

    useEffect(() => {
        if (!show || !hovered) return;
        place();
        const onScroll = () => place();
        const onResize = () => place();
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onResize);
        };
    }, [show, hovered, place]);

    return (
        <span
            ref={ref}
            className="relative inline-flex"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
            {show && hovered && canUseDOM &&
                createPortal(
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        role="tooltip"
                        style={{
                            top: `${pos.y}px`,
                            left: `${pos.x}px`,
                            transform: "translateY(-50%)",
                        }}
                        className="fixed z-[2000] pointer-events-none whitespace-nowrap rounded-lg bg-primary text-white text-sm px-3 py-2 shadow-xl border border-primary/20"
                    >
                        {label}
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rotate-45" />
                    </motion.div>,
                    document.body
                )}
        </span>
    );
};

/* --------------------------------
   Enhanced Badge component using primary colors
----------------------------------*/
const Badge = ({ count, isCollapsed, variant = "primary" }) => {
    if (!count || count <= 0) return null;

    const variants = {
        primary: "bg-primary text-white",
        accent: "bg-accent text-white",
        success: "bg-emerald-500 text-white",
        warning: "bg-amber-500 text-white"
    };

    if (isCollapsed) {
        return (
            <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                aria-label={`${count} new`}
                className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full ${variants[variant]} text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-lg`}
            >
                {fmtCount(count)}
            </motion.span>
        );
    }

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            aria-label={`${count} new`}
            className={`ml-auto inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full ${variants[variant]} text-xs font-semibold shadow-lg`}
        >
            {fmtCount(count)}
        </motion.span>
    );
};

/* --------------------------------
   User Profile Component
----------------------------------*/
const UserProfile = ({ user, isCollapsed, onToggle, logo }) => {
    if (!user) return null;

    return (
        <motion.div
            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 p-4'} cursor-pointer group`}
            onClick={onToggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="relative">
                {user.photo_url ? (
                    <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={`/storage/${user.photo_url}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-lg group-hover:shadow-xl transition-all"
                    />
                ) : (
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-semibold shadow-lg group-hover:shadow-xl transition-all"
                    >
                        {user.name?.charAt(0)?.toUpperCase()}
                    </motion.div>
                )}
            </div>

            {!isCollapsed && (
                <motion.div
                    variants={itemAnim}
                    initial="closed"
                    animate="open"
                    className="flex-1 min-w-0"
                >
                    <p className="font-semibold text-gray-900 text-sm truncate">
                        {user.name}
                    </p>
                    <p className="text-gray-500 text-xs truncate capitalize">
                        {user.role?.toLowerCase() || 'user'}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

/* --------------------------------
   Quick Actions Component
----------------------------------*/
const QuickActions = ({ isOpen, quickActions = [] }) => {
    if (!isOpen || !quickActions.length) return null;

    return (
        <motion.div
            variants={itemAnim}
            initial="closed"
            animate="open"
            className="px-4 pb-4 space-y-3"
        >
            {quickActions.map((action, index) => (
                <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:shadow-xl transition-all shadow-lg"
                >
                    <action.Icon size={16} />
                    {action.label}
                </motion.button>
            ))}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-sm"
                />
            </div>
        </motion.div>
    );
};

/* --------------------------------
   Navigation Item Component
----------------------------------*/
const NavItem = ({
                     item,
                     isOpen,
                     isActive,
                     count,
                     onMarkRead,
                     hasSubMenu = false,
                     isSubMenuOpen = false,
                     onToggleSubMenu
                 }) => {
    const { name, Icon, path, description } = item;

    if (path && !hasSubMenu) {
        return (
            <HoverTooltip show={!isOpen} label={name}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block ${isOpen ? "w-[244px]" : "w-[60px]"}`}
                >
                    <Link
                        href={path}
                        onClick={() => onMarkRead(path)}
                        className={classNames(
                            isActive
                                ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 shadow-md"
                                : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary/5 hover:text-primary border-transparent",
                            isOpen ? "px-4 pr-3" : "px-3",
                            "group relative rounded-xl flex items-center gap-3 py-3 transition-all duration-200 border"
                        )}
                        title={!isOpen ? name : undefined}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <span className="relative inline-flex">
                            {isActive ? (
                                <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent shadow-lg">
                                    <Icon className="shrink-0 text-white" size={18} />
                                </div>
                            ) : (
                                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-primary/10 group-hover:to-accent/10 transition-all">
                                    <Icon className="shrink-0 text-gray-600 group-hover:text-primary" size={18} />
                                </div>
                            )}
                            {!isOpen && <Badge count={count} isCollapsed variant="primary" />}
                        </span>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    variants={itemAnim}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                    className="flex-1 min-w-0"
                                >
                                    <span className="font-semibold text-gray-900 block">{name}</span>
                                    {description && (
                                        <span className="text-xs text-gray-500 block mt-0.5">{description}</span>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isOpen && <Badge count={count} variant="primary" />}
                    </Link>
                </motion.div>
            </HoverTooltip>
        );
    }

    return (
        <HoverTooltip show={!isOpen} label={name}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onToggleSubMenu}
                className={classNames(
                    isActive
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20"
                        : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary/5 hover:text-primary border-transparent",
                    isOpen ? "px-4 pr-3" : "px-3",
                    "group relative w-full rounded-xl flex items-center justify-between py-3 transition-all duration-200 border"
                )}
                title={!isOpen ? name : undefined}
                aria-expanded={isOpen ? isSubMenuOpen : false}
                type="button"
            >
                <span className="flex items-center gap-3">
                    <span className="relative inline-flex">
                        {isActive ? (
                            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent shadow-lg">
                                <Icon className="shrink-0 text-white" size={18} />
                            </div>
                        ) : (
                            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-primary/10 group-hover:to-accent/10 transition-all">
                                <Icon className="shrink-0 text-gray-600 group-hover:text-primary" size={18} />
                            </div>
                        )}
                        {!isOpen && <Badge count={count} isCollapsed variant="primary" />}
                    </span>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                variants={itemAnim}
                                initial="closed"
                                animate="open"
                                exit="closed"
                                className="flex-1 border min-w-0 text-left"
                            >
                                <span className="font-semibold text-gray-900 block">{name}</span>
                                {description && (
                                    <span className="text-xs text-gray-500 block mt-0.5">{description}</span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </span>

                {isOpen && (
                    <span className="flex items-center gap-2">
                        <Badge count={count} variant="primary" />
                        {hasSubMenu && (
                            <ChevronDown
                                className={classNames(
                                    "transition-transform duration-200",
                                    isSubMenuOpen ? "rotate-180 text-primary" : "text-gray-400"
                                )}
                                size={18}
                            />
                        )}
                    </span>
                )}
            </motion.button>
        </HoverTooltip>
    );
};

/* Animation config */
const sidebarAnim = {
    open: { width: "280px", transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
    closed: { width: "80px", transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

const itemAnim = {
    open: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

const subMenuAnim = {
    enter: {
        height: "auto",
        opacity: 1,
        transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.2, ease: "easeIn" },
    },
};

/* --------------------------------
   Main Reusable Sidebar Component
----------------------------------*/
/* --------------------------------
   Main Reusable Sidebar Component
----------------------------------*/
const Sidebar = ({
                     isOpen,
                     setIsOpen,
                     config,
                     counts,
                     unreads,
                     user,
                     onNavigate,
                     isMobile = false
                 }) => {
    const [openedIndex, setOpenedIndex] = useState(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { url } = usePage();

    // FOR MOBILE: Always show expanded sidebar when open
    const shouldShowExpanded = isMobile ? true : isOpen;

    const handleNavigation = (href) => {
        if (isMobile && onNavigate) {
            onNavigate();
        }
    };

    // Destructure config with defaults
    const {
        appName = "RealSync",
        appDescription = "Dashboard",
        mainMenus = [],
        adminMenus = [],
        userMenu = [
            { name: "Profile", Icon: User, path: "/profile" },
            { name: "Settings", Icon: Settings, path: "/settings" },
        ],
        quickActions = [],
        showSearch = true,
        categorizeNotification
    } = config;

    /* Mark notifications as read */
    const markAllOfPathAsRead = useCallback(async (path) => {
        if (!unreads.length) return;

        // const ids = [];
        // for (const n of unreads) {
        //     const p = categorizeNotification ? categorizeNotification(n) : null;
        //     if (p === path) ids.push(n.id);
        // }
        // if (!ids.length) return;
        //
        // try {
        //     await router.post(
        //         "/notifications/read-batch",
        //         { ids },
        //         { preserveScroll: true, preserveState: true }
        //     );
        // } catch (e) {
        //     ids.forEach((id) => {
        //         router.post(`/notifications/${id}/read`, {}, { preserveScroll: true, preserveState: true });
        //     });
        // }
    }, [unreads, categorizeNotification]);

    const getCount = useCallback(
        (path, subMenu) => {
            const base = counts[path] ?? 0;
            if (!Array.isArray(subMenu) || subMenu.length === 0) return base;
            return base + subMenu.reduce((acc, sm) => acc + (counts[sm.path] ?? 0), 0);
        },
        [counts]
    );

    const withMarkRead = useCallback((path, originalOnClick) => {
        return (e) => {
            try { markAllOfPathAsRead(path); } catch {}
            originalOnClick?.(e);
        };
    }, [markAllOfPathAsRead]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (window.innerWidth < 768 && isOpen && !event.target.closest('.sidebar-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen, setIsOpen]);

    const isAdmin = user?.role === 'Admin' || user?.role === 'Broker';

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && window.innerWidth < 768 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[998] md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className="sidebar-container bg-white border-r border-gray-200 h-screen z-[999] fixed shadow-xl overflow-hidden flex flex-col"
                variants={sidebarAnim}
                animate={shouldShowExpanded ? "open" : "closed"} // Use shouldShowExpanded here
                initial={false}
            >
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-br from-white to-primary/5">
                    <div className={`flex items-center justify-between p-4 ${shouldShowExpanded ? 'pr-3' : ''}`}>
                        <Link
                            href="/"
                            className="flex items-center space-x-3 transition-all hover:scale-105 active:scale-95"
                            title={!shouldShowExpanded ? appName : undefined}
                        >
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                className="relative"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center">
                                    {logo ? (
                                        <img src={logo} alt={`${appName} Logo`} className="w-10 h-10" />
                                    ) : (
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                            <Building className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                            {shouldShowExpanded && ( // Use shouldShowExpanded here
                                <motion.div
                                    variants={itemAnim}
                                    initial="closed"
                                    animate="open"
                                    className="flex flex-col"
                                >
                                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                        {appName}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">{appDescription}</span>
                                </motion.div>
                            )}
                        </Link>

                    </div>

                    {/* Quick Actions */}
                    {(quickActions.length > 0 || showSearch) && (
                        <QuickActions isOpen={shouldShowExpanded} quickActions={quickActions} /> // Use shouldShowExpanded here
                    )}
                </div>

                {/* Navigation Sections */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 [scrollbar-gutter:stable]">
                    {/* Main Navigation */}
                    {shouldShowExpanded && mainMenus.length > 0 && ( // Use shouldShowExpanded here
                        <motion.p
                            variants={itemAnim}
                            initial="closed"
                            animate="open"
                            className="px-6 pt-6 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                            Navigation
                        </motion.p>
                    )}

                    <ul className="px-3 py-2 space-y-2">
                        {mainMenus.map((item, i) => {
                            const hasSubMenu = Array.isArray(item.subMenu) && item.subMenu.length > 0;
                            const isSectionOpen = openedIndex === i;
                            const isActive = url.startsWith(item.path);
                            const totalCount = getCount(item.path, item.subMenu);

                            return (
                                <motion.li
                                    key={item.name}
                                    className="relative"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <NavItem
                                        item={item}
                                        isOpen={shouldShowExpanded} // Use shouldShowExpanded here
                                        isActive={isActive}
                                        count={totalCount}
                                        onMarkRead={withMarkRead}
                                        hasSubMenu={hasSubMenu}
                                        isSubMenuOpen={isSectionOpen}
                                        onToggleSubMenu={() => setOpenedIndex(isSectionOpen ? null : i)}
                                    />
                                </motion.li>
                            );
                        })}
                    </ul>

                    {/* Admin Section */}
                    {isAdmin && adminMenus.length > 0 && shouldShowExpanded && ( // Use shouldShowExpanded here
                        <>
                            <motion.p
                                variants={itemAnim}
                                initial="closed"
                                animate="open"
                                className="px-6 pt-6 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                            >
                                Administration
                            </motion.p>
                            <ul className="px-3 py-2 space-y-2">
                                {adminMenus.map((item) => {
                                    const isActive = url.startsWith(item.path);
                                    const count = counts[item.path] ?? 0;

                                    return (
                                        <motion.li key={item.name} whileHover={{ scale: 1.02 }}>
                                            <NavItem
                                                item={item}
                                                isOpen={shouldShowExpanded} // Use shouldShowExpanded here
                                                isActive={isActive}
                                                count={count}
                                                onMarkRead={withMarkRead}
                                            />
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </div>

                {/* User Section */}
                <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50/50">
                    <UserProfile
                        user={user}
                        isCollapsed={!shouldShowExpanded} // Use shouldShowExpanded here
                        logo={logo}
                    />
                </div>
            </motion.div>

            {/* Mobile toggle button when sidebar is closed */}
            {!isOpen && window.innerWidth < 768 && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="md:hidden fixed bottom-6 left-6 z-[999] p-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all"
                >
                    <Menu size={20} />
                </motion.button>
            )}
        </>
    );
};

export default Sidebar;
