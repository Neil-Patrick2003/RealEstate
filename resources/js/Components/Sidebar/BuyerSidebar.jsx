import React, {useCallback, useEffect, useRef, useState} from 'react';
import { motion } from 'framer-motion';
import {
    ChevronDown,
    Home,
    Mail,
    CalendarDays,
    Star,
    MessageSquare,
    Handshake,
    BarChart3,
} from 'lucide-react';
import logo from '../../../assets/framer_logo.png';
import { Link, usePage } from '@inertiajs/react';
import { createPortal } from "react-dom";


/* --------------------------------
   small utils
----------------------------------*/
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
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
        window.addEventListener("scroll", onScroll, true); // capture to catch inner scrollers
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
            {show && hovered &&
                createPortal(
                    <div
                        role="tooltip"
                        style={{ top: `${pos.y}px`, left: `${pos.x}px`, transform: "translateY(-50%)" }}
                        className="fixed z-[2000] border pointer-events-none whitespace-nowrap rounded-md bg-primary text-white text-xs px-4 py-2 shadow-lg"
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
    { name: 'Dashboard', Icon: Home, path: '/dashboard' },
    { name: 'Messages', Icon: MessageSquare, path: '/chat' },
    { name: 'Inquiries', Icon: Mail, path: '/inquiries' },
    { name: 'Tripping', Icon: CalendarDays, path: '/trippings' },
    { name: 'Favourites', Icon: Star, path: '/favourites' },
    { name: 'Deal', Icon: Handshake, path: '/deals' },
    { name: 'Transactions', Icon: BarChart3, path: '/transactions' },
];

const sidebarAnim = {
    open: { width: '18rem', transition: { duration: 0.3, ease: 'easeInOut' } },
    closed: { width: '5rem', transition: { duration: 0.3, ease: 'easeInOut' } },
};

const subMenuAnim = {
    enter: { height: 'auto', opacity: 1, overflow: 'hidden', transition: { duration: 0.2 } },
    exit: { height: 0, opacity: 0, overflow: 'hidden', transition: { duration: 0.2 } },
};

const BuyerSidebar = ({ isOpen, setIsOpen }) => {
    const [openedIndex, setOpenedIndex] = useState(null);
    const { url } = usePage(); // inertia exposes .url

    return (
        <div className="flex" role="navigation" aria-label="Buyer sidebar">
            <motion.div
                className="bg-white border-r border-gray-100 h-screen z-[999]    md:fixed fixed shadow-sm"
                variants={sidebarAnim}
                animate={isOpen ? 'open' : 'closed'}
                initial={false}
            >
                {/* Header / Logo */}
                <div
                    className={classNames(
                        'flex items-center border-b border-gray-200 py-4',
                        isOpen ? 'px-4 gap-3 justify-start' : 'px-4 justify-center'
                    )}
                >
                    <Link href="/" className="flex items-center space-x-2" title={!isOpen ? 'MJVI Realty' : undefined}>
                        <img src={logo} width={40} alt="MJVI Realty" />
                        {isOpen && <span className="text-lg font-bold text-green-700">MJVI Realty</span>}
                    </Link>
                </div>

                {/* Section Title */}
                {isOpen && (
                    <p className="pl-5 pt-4 text-xs font-bold text-gray-400 uppercase tracking-wide">Navigation</p>
                )}

                {/* Menu List */}
                <ul className="px-3 pt-4 pb-8 space-y-1 text-sm font-medium overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 h-[calc(100vh-120px)]">
                    {menus.map(({ name, Icon, path, subMenu }, i) => {
                        const hasSubMenu = Array.isArray(subMenu) && subMenu.length > 0;
                        const isSectionOpen = openedIndex === i;
                        const isActive =
                            (path && url.startsWith(path)) ||
                            (hasSubMenu && subMenu.some((item) => url.startsWith(item.path)));

                        return (
                            <React.Fragment key={name}>
                                    <li className="relative ">
                                        {/* Simple link (no submenu) */}
                                        {path && !hasSubMenu ? (
                                            <HoverTooltip show={!isOpen} label={name}>
                                                <Link
                                                    href={path}
                                                    className={classNames(
                                                        isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                                                        isOpen ? 'px-4' : 'px-5',
                                                        ' flex items-center gap-3 py-3 rounded-lg transition-all'
                                                    )}
                                                    title={!isOpen ? name : undefined}
                                                    aria-current={isActive ? 'page' : undefined}
                                                >
                                                    <Icon className="shrink-0" size={20} aria-hidden="true" />
                                                    {isOpen && <span className="truncate">{name}</span>}
                                                </Link>
                                            </HoverTooltip>
                                        ) : (
                                            // Button with submenu
                                            <HoverTooltip show={!isOpen} label={name}>
                                                <button
                                                    onClick={() => setOpenedIndex(isSectionOpen ? null : i)}
                                                    className={classNames(
                                                        isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                                                        isOpen ? 'px-4' : 'px-5',
                                                        'w-full flex items-center justify-between py-3 rounded-lg transition-all'
                                                    )}
                                                    title={!isOpen ? name : undefined}
                                                    aria-expanded={isOpen ? isSectionOpen : false}
                                                    aria-controls={isOpen ? `submenu-${i}` : undefined}
                                                    type="button"
                                                >
                                                <span className="flex items-center gap-3">
                                                  <Icon className="shrink-0" size={20} aria-hidden="true" />
                                                    {isOpen && <span className="truncate">{name}</span>}
                                                </span>
                                                    {isOpen && hasSubMenu && (
                                                        <ChevronDown
                                                            className={`transition-transform ${isSectionOpen ? 'rotate-180' : ''}`}
                                                            size={18}
                                                            aria-hidden="true"
                                                        />
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
                                        animate={isSectionOpen ? 'enter' : 'exit'}
                                        className="ml-9 pl-3 pr-1 border-l border-gray-200 text-sm text-gray-500 space-y-1"
                                    >
                                        {subMenu.map(({ name: subName, Icon: SubIcon, path: subPath }) => {
                                            const subActive = url.startsWith(subPath);
                                            return (
                                                <li key={subName}>
                                                    <Link
                                                        href={subPath}
                                                        className={classNames(
                                                            subActive
                                                                ? 'text-green-700 bg-green-50'
                                                                : 'hover:text-green-700 hover:bg-gray-50',
                                                            'flex items-center gap-2 py-2 px-3 rounded-md transition'
                                                        )}
                                                        aria-current={subActive ? 'page' : undefined}
                                                    >
                                                        {SubIcon && <SubIcon className="shrink-0" size={16} aria-hidden="true" />}
                                                        <span className="truncate">{subName}</span>
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
            </motion.div>
        </div>
    );
};

export default BuyerSidebar;
