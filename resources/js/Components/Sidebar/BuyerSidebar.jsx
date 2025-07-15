import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import logo from '../../../assets/framer_logo.png';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
    faMapLocationDot,
    faEnvelope,
    faCalendar,
    faChartSimple, faStar, faMessage,
} from '@fortawesome/free-solid-svg-icons';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const menus = [
    { name: "Dashboard", Icon: faHouse, path: "/dashboard" },
    { name: "Messages", Icon: faMessage, path: "/chat" },
    { name: "Inquiries", Icon: faEnvelope, path: "/inquiries" },
    { name: "Tripping", Icon: faCalendar, path: "/trippings" },
    { name: "Favourites", Icon: faStar, path: "/favourites" },
    { name: "Transactions", Icon: faChartSimple, path: "/transactions" },
];

const Sidebar_animation = {
    open: {
        width: '18rem',
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
    closed: {
        width: '5rem',
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
};

const subMenuDrawer = {
    enter: {
        height: 'auto',
        opacity: 1,
        overflow: 'hidden',
        transition: { duration: 0.2 },
    },
    exit: {
        height: 0,
        opacity: 0,
        overflow: 'hidden',
        transition: { duration: 0.2 },
    },
};

const SellerSidebar = ({ isOpen, setIsOpen }) => {
    const [clicked, setClicked] = useState(null);
    const { url } = usePage();

    return (
        <div className="flex">
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
                    <Link href="/" className="flex items-center space-x-2">
                        <img src={logo} width={40} alt="MJVI Realty" />
                        {isOpen && <span className="text-lg font-bold text-green-700">MJVI Realty</span>}
                    </Link>
                </div>

                {/* Section Title */}
                {isOpen && (
                    <p className="pl-5 pt-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Navigation
                    </p>
                )}

                {/* Menu List */}
                <ul className="px-3 pt-4 pb-8 space-y-1 text-sm font-medium overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 h-[calc(100vh-120px)]">
                    {menus.map(({ name, Icon, path, subMenu }, i) => {
                        const isClicked = clicked === i;
                        const hasSubMenu = subMenu?.length > 0;
                        const isActive = url.startsWith(path) || subMenu?.some((item) => url.startsWith(item.path));

                        return (
                            <React.Fragment key={name}>
                                <li className="relative">
                                    {path && !hasSubMenu ? (
                                        <Link
                                            href={path}
                                            className={classNames(
                                                isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                                                isOpen ? 'px-4' : 'px-5',
                                                'flex items-center gap-3 py-3 rounded-lg transition-all'
                                            )}
                                        >
                                            <FontAwesomeIcon icon={Icon} className="w-5 h-5" />
                                            {isOpen && <span>{name}</span>}
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => setClicked(isClicked ? null : i)}
                                            className={classNames(
                                                isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'text-gray-600 hover:bg-green-50 hover:text-green-700',
                                                isOpen ? 'px-4' : 'px-5',
                                                'w-full flex items-center justify-between py-3 rounded-lg transition-all'
                                            )}
                                        >
                                            <span className="flex items-center gap-3">
                                                <FontAwesomeIcon icon={Icon} className="w-5 h-5" />
                                                {isOpen && <span>{name}</span>}
                                            </span>
                                            {isOpen && hasSubMenu && (
                                                <ChevronDown
                                                    className={`transition-transform ${isClicked ? 'rotate-180' : ''}`}
                                                    size={18}
                                                />
                                            )}
                                        </button>
                                    )}
                                </li>

                                {/* Submenu */}
                                {hasSubMenu && (
                                    <motion.ul
                                        variants={subMenuDrawer}
                                        initial="exit"
                                        animate={isClicked ? 'enter' : 'exit'}
                                        className="ml-9 pl-3 pr-1 border-l border-gray-200 text-sm text-gray-500 space-y-1"
                                    >
                                        {subMenu.map(({ name: subName, Icon: SubIcon, path: subPath }) => (
                                            <li key={subName}>
                                                <Link
                                                    href={subPath}
                                                    className={classNames(
                                                        url.startsWith(subPath)
                                                            ? 'text-green-700 bg-green-50'
                                                            : 'hover:text-green-700 hover:bg-gray-50',
                                                        'flex items-center gap-2 py-2 px-3 rounded-md transition'
                                                    )}
                                                >
                                                    {SubIcon && <FontAwesomeIcon icon={SubIcon} className="w-4 h-4" />}
                                                    {isOpen && <span>{subName}</span>}
                                                </Link>
                                            </li>
                                        ))}
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

export default SellerSidebar;
