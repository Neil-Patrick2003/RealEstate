import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    ChevronDown,
    Home,
    Mail,
    CalendarDays,
    Star,
    MessageSquare,
    Handshake,
    BarChart3,
} from "lucide-react";
import logo from "../../../assets/framer_logo.png";
import { Link, usePage, router } from "@inertiajs/react";
import { createPortal } from "react-dom";

/* --------------------------------
   small utils
----------------------------------*/
const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined"
const classNames = (...c) => c.filter(Boolean).join(" ");
const fmtCount = (n) =>
    n > 0
        ? n < 1000
            ? n
            : n < 10000
                ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
                : Math.round(n / 1000) + "k"
        : 0;

/* Detect which sidebar path a notification belongs to */
const PATHS = {
    chat: "/chat",
    inquiries: "/inquiries",
    trippings: "/trippings",
    deals: "/deals",
};
function categorizeNotifToPath(n) {
    const link = n?.data?.link || "";
    if (link) {
        for (const p of Object.values(PATHS)) {
            if (link.startsWith(p)) return p;
        }
    }
    const title = (n?.data?.title || n?.title || "").toLowerCase();
    const msg = (n?.data?.message || n?.message || "").toLowerCase();
    const text = `${title} ${msg}`;

    if (/(inquiry|lead)\b/.test(text)) return PATHS.inquiries;
    if (/(tripping|visit|site\s*visit|schedule(d)?\s*tripping)\b/.test(text)) return PATHS.trippings;
    if (/(deal|offer|agreement|reservation|closed\s*deal)\b/.test(text)) return PATHS.deals;
    if (/(message|chat|replied|responded)\b/.test(text)) return PATHS.chat;

    return null;
}

/* Hover tooltip shown only when the sidebar is collapsed */
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
                    <div
                        role="tooltip"
                        style={{
                            top: `${pos.y}px`,
                            left: `${pos.x}px`,
                            transform: "translateY(-50%)",
                        }}
                        className="fixed z-[2000] pointer-events-none whitespace-nowrap rounded-md bg-primary text-white text-xs px-4 py-2 shadow-lg"
                    >
                        {label}
                    </div>,
                    document.body
                )}
    </span>
    );
};

/* --------------------------------
   menu config (lucide icons)
----------------------------------*/
const menus = [
    { name: "Dashboard", Icon: Home, path: "/dashboard" },
    { name: "Messages", Icon: MessageSquare, path: "/chat" },
    { name: "Inquiries", Icon: Mail, path: "/inquiries" },
    // { name: "Tripping", Icon: CalendarDays, path: "/trippings" },
    { name: "Favourites", Icon: Star, path: "/favourites" },
    // { name: "Deal", Icon: Handshake, path: "/deals" },
    { name: "Transactions", Icon: BarChart3, path: "/transactions" },
];

const sidebarAnim = {
    open: { width: "18rem", transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { width: "5rem", transition: { duration: 0.3, ease: "easeInOut" } },
};
const subMenuAnim = {
    enter: {
        height: "auto",
        opacity: 1,
        overflow: "hidden",
        transition: { duration: 0.2 },
    },
    exit: {
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: { duration: 0.2 },
    },
};

/* --------------------------------
   Badge component
----------------------------------*/
const Badge = ({ count, isCollapsed }) => {
    if (!count || count <= 0) return null;
    if (isCollapsed) {
        const t = String(count);
        return (
            <span
                aria-label={`${count} new`}
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
            >
        {t.length > 2 ? "•" : t}
      </span>
        );
    }
    return (
        <span
            aria-label={`${count} new`}
            className="ml-auto inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-semibold"
        >
      {fmtCount(count)}
    </span>
    );
};

/* --------------------------------
   BuyerSidebar with counts + auto mark-as-read
   props:
     - counts: { [path: string]: number }
     - unreads: Notification[]  // array of unread notifications
----------------------------------*/
const BuyerSidebar = ({ isOpen, setIsOpen, counts = {}, unreads = [] }) => {
    const [openedIndex, setOpenedIndex] = useState(null);
    const { url } = usePage();

    /* Build helper to mark all unreads that belong to a given path as read */
    const markAllOfPathAsRead = useCallback(async (path) => {
        // gather ids
        const ids = [];
        for (const n of unreads) {
            const p = categorizeNotifToPath(n);
            if (p === path) ids.push(n.id);
        }
        if (!ids.length) return;

        // Try bulk first
        try {
            await router.post(
                "/notifications/read-batch",
                { ids },
                { preserveScroll: true, preserveState: true }
            );
            return;
        } catch (e) {
            // ignore; fall through to per-id
        }

        // Fallback: mark one-by-one
        ids.forEach((id) => {
            router.post(`/notifications/${id}/read`, {}, { preserveScroll: true, preserveState: true });
        });
    }, [unreads]);

    const getCount = useCallback(
        (path, subMenu) => {
            const base = counts[path] ?? 0;
            if (!Array.isArray(subMenu) || subMenu.length === 0) return base;
            return base + subMenu.reduce((acc, sm) => acc + (counts[sm.path] ?? 0), 0);
        },
        [counts]
    );

    // Wrap a link/button click to also mark-as-read for that path
    const withMarkRead = useCallback((path, originalOnClick) => {
        return (e) => {
            // fire-and-forget mark read (don’t block navigation)
            try { markAllOfPathAsRead(path); } catch {}
            originalOnClick?.(e);
        };
    }, [markAllOfPathAsRead]);

    return (
        <div className="flex" role="navigation" aria-label="Buyer sidebar">
            <motion.div
                className="bg-white border-r border-gray-100 h-screen z-[999] md:fixed fixed shadow-sm overflow-hidden"
                variants={sidebarAnim}
                animate={isOpen ? "open" : "closed"}
                initial={false}
            >
                {/* Header / Logo */}
                <div
                    className={classNames(
                        "flex items-center border-b border-gray-200 py-4",
                        isOpen ? "px-4 gap-3 justify-start" : "px-4 justify-center"
                    )}
                >
                    <Link
                        href="/"
                        className="flex items-center space-x-2"
                        title={!isOpen ? "MJVI Realty" : undefined}
                    >
                        <img src={logo} width={40} alt="MJVI Realty" />
                        {isOpen && (
                            <span className="text-lg font-bold text-green-700">MJVI Realty</span>
                        )}
                    </Link>
                </div>

                {/* Section Title */}
                {isOpen && (
                    <p className="pl-5 pt-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Navigation
                    </p>
                )}

                {/* Scroll wrapper */}
                <div className="relative px-3 pt-4 pb-8 h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 [scrollbar-gutter:stable]">
                    <ul className="space-y-1 text-sm font-medium">
                        {menus.map(({ name, Icon, path, subMenu }, i) => {
                            const hasSubMenu = Array.isArray(subMenu) && subMenu.length > 0;
                            const isSectionOpen = openedIndex === i;
                            const isActive =
                                (path && url.startsWith(path)) ||
                                (hasSubMenu && subMenu.some((item) => url.startsWith(item.path)));
                            const totalCount = getCount(path, subMenu);

                            return (
                                <React.Fragment key={name}>
                                    {/* full-width row */}
                                    <li className="relative">
                                        {path && !hasSubMenu ? (
                                            <HoverTooltip show={!isOpen} label={name}>
                                                <Link
                                                    href={path}
                                                    onClick={withMarkRead(path)}
                                                    className={classNames(
                                                        isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                                                        isOpen ? "px-5  w-[252px]" : "px-4  w-[60px]",
                                                        "relative rounded-lg flex items-center gap-3 py-3 transition-all"
                                                    )}
                                                    title={!isOpen ? name : undefined}
                                                    aria-current={isActive ? "page" : undefined}
                                                >
                          <span className="relative inline-flex">
                            <Icon className="shrink-0" size={20} aria-hidden="true" />
                              {!isOpen && <Badge count={totalCount} isCollapsed />}
                          </span>
                                                    {isOpen && <span className="truncate">{name}</span>}
                                                    {isOpen && <Badge count={totalCount} />}
                                                </Link>
                                            </HoverTooltip>
                                        ) : (
                                            // Button with submenu
                                            <HoverTooltip show={!isOpen} label={name}>
                                                <button
                                                    onClick={() => setOpenedIndex(isSectionOpen ? null : i)}
                                                    className={classNames(
                                                        isActive
                                                            ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                                                            : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                                                        isOpen ? "px-5" : "px-6",
                                                        "relative w-full flex items-center justify-between py-3 rounded-none transition-all"
                                                    )}
                                                    title={!isOpen ? name : undefined}
                                                    aria-expanded={isOpen ? isSectionOpen : false}
                                                    aria-controls={isOpen ? `submenu-${i}` : undefined}
                                                    type="button"
                                                >
                          <span className="flex items-center gap-3">
                            <span className="relative inline-flex">
                              <Icon className="shrink-0" size={20} aria-hidden="true" />
                                {!isOpen && <Badge count={totalCount} isCollapsed />}
                            </span>
                              {isOpen && <span className="truncate">{name}</span>}
                          </span>
                                                    {isOpen && (
                                                        <span className="flex items-center gap-2">
                              <Badge count={totalCount} />
                                                            {hasSubMenu && (
                                                                <ChevronDown
                                                                    className={`transition-transform ${isSectionOpen ? "rotate-180" : ""}`}
                                                                    size={18}
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                            </span>
                                                    )}
                                                </button>
                                            </HoverTooltip>
                                        )}
                                    </li>

                                    {/* Submenu (only when sidebar is open) */}
                                    {hasSubMenu && isOpen && (
                                        <motion.ul
                                            id={`submenu-${i}`}
                                            variants={subMenuAnim}
                                            initial="exit"
                                            animate={isSectionOpen ? "enter" : "exit"}
                                            className="ml-9 pl-3 pr-1 border-l border-gray-200 text-sm text-gray-500 space-y-1"
                                        >
                                            {subMenu.map(({ name: subName, Icon: SubIcon, path: subPath }) => {
                                                const subActive = url.startsWith(subPath);
                                                const subCount = counts[subPath] ?? 0;
                                                return (
                                                    <li key={subName}>
                                                        <Link
                                                            href={subPath}
                                                            onClick={withMarkRead(subPath)}
                                                            className={classNames(
                                                                subActive
                                                                    ? "text-green-700 bg-green-50"
                                                                    : "hover:text-green-700 hover:bg-gray-50",
                                                                "relative flex items-center gap-2 py-2 px-3 rounded-md transition"
                                                            )}
                                                            aria-current={subActive ? "page" : undefined}
                                                        >
                              <span className="relative inline-flex">
                                {SubIcon && (
                                    <SubIcon className="shrink-0" size={16} aria-hidden="true" />
                                )}
                              </span>
                                                            <span className="truncate">{subName}</span>
                                                            <span className="ml-auto">
                                <Badge count={subCount} />
                              </span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </motion.ul>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default BuyerSidebar;
