import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import logo from '../../../assets/framer_logo.png';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
    faEnvelope,
    faCalendar,
    faChartSimple,
    faStar,
    faMessage,
    faHandshakeAngle,
} from '@fortawesome/free-solid-svg-icons';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

/* Hover tooltip shown only when the sidebar is collapsed */
const HoverTooltip = ({ show, label, children }) => (
    <div className="relative group">
        {children}
        {show && (
            <div
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-[1000]
                   whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow-lg
                   opacity-0 -translate-x-1 transition-all duration-150
                   group-hover:opacity-100 group-hover:translate-x-0"
            >
                {label}
            </div>
        )}
    </div>
);

const menus = [
    { name: 'Dashboard', Icon: faHouse, path: '/dashboard' },
    { name: 'Messages', Icon: faMessage, path: '/chat' },
    { name: 'Inquiries', Icon: faEnvelope, path: '/inquiries' },
    { name: 'Tripping', Icon: faCalendar, path: '/trippings' },
    { name: 'Favourites', Icon: faStar, path: '/favourites' },
    { name: 'Deal', Icon: faHandshakeAngle, path: '/deals' },
    { name: 'Transactions', Icon: faChartSimple, path: '/transactions' },
];

const Sidebar_animation = {
    open: { width: '18rem', transition: { duration: 0.3, ease: 'easeInOut' } },
    closed: { width: '5rem', transition: { duration: 0.3, ease: 'easeInOut' } },
};

const subMenuDrawer = {
    enter: { height: 'auto', opacity: 1, overflow: 'hidden', transition: { duration: 0.2 } },
    exit: { height: 0, opacity: 0, overflow: 'hidden', transition: { duration: 0.2 } },
};

const BuyerSidebar = ({ isOpen, setIsOpen }) => {
    const [clicked, setClicked] = useState(null);
    const { url } = usePage(); // inertia exposes .url

    return (
        <div className="flex" role="navigation" aria-label="Buyer sidebar">
            <motion.div
                className="bg-white border-r border-gray-100 h-screen z-[999] overflow-hidden md:relative fixed shadow-sm"
                variants={Sidebar_animation}
                animate={isOpen ? 'open' : 'closed'}
                initial={false}
            >
                {/* Logo */}
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
                        const isClicked = clicked === i;
                        const hasSubMenu = Array.isArray(subMenu) && subMenu.length > 0;
                        const isActive =
                            (path && url.startsWith(path)) ||
                            (hasSubMenu && subMenu.some((item) => url.startsWith(item.path)));

                        return (
                            <React.Fragment key={name}>
                                <li className="relative">
                                    {path && !hasSubMenu ? (
                                        <HoverTooltip show={!isOpen} label={name}>
                                            <Link
                                                href={path}
                                                className={classNames(
                                                    isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                                                    isOpen ? 'px-4' : 'px-5',
                                                    'flex items-center gap-3 py-3 rounded-lg transition-all'
                                                )}
                                                title={!isOpen ? name : undefined}
                                                aria-current={isActive ? 'page' : undefined}
                                            >
                                                <FontAwesomeIcon icon={Icon} className="w-5 h-5 shrink-0" />
                                                {isOpen && <span className="truncate">{name}</span>}
                                            </Link>
                                        </HoverTooltip>
                                    ) : (
                                        <HoverTooltip show={!isOpen} label={name}>
                                            <button
                                                onClick={() => setClicked(isClicked ? null : i)}
                                                className={classNames(
                                                    isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                                                    isOpen ? 'px-4' : 'px-5',
                                                    'w-full flex items-center justify-between py-3 rounded-lg transition-all'
                                                )}
                                                title={!isOpen ? name : undefined}
                                                aria-expanded={isOpen ? isClicked : false}
                                                aria-controls={isOpen ? `submenu-${i}` : undefined}
                                                type="button"
                                            >
                        <span className="flex items-center gap-3">
                          <FontAwesomeIcon icon={Icon} className="w-5 h-5 shrink-0" />
                            {isOpen && <span className="truncate">{name}</span>}
                        </span>
                                                {isOpen && hasSubMenu && (
                                                    <ChevronDown
                                                        className={`transition-transform ${isClicked ? 'rotate-180' : ''}`}
                                                        size={18}
                                                    />
                                                )}
                                            </button>
                                        </HoverTooltip>
                                    )}
                                </li>

                                {/* Submenu: render only when sidebar is open */}
                                {hasSubMenu && isOpen && (
                                    <motion.ul
                                        id={`submenu-${i}`}
                                        variants={subMenuDrawer}
                                        initial="exit"
                                        animate={isClicked ? 'enter' : 'exit'}
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
                                                        {SubIcon && <FontAwesomeIcon icon={SubIcon} className="w-4 h-4 shrink-0" />}
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
