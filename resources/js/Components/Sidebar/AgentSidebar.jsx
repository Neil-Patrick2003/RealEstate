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
    faChartSimple,
} from '@fortawesome/free-solid-svg-icons';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
const menus = [
    {
        name: "Dashboard",
        Icon: faHouse,
        path: "/agents/dashboard",
    },
    {
        name: "Properties",
        Icon: faEnvelope,
        subMenu: [
            {
                name: "Properties",
                Icon: faMapLocationDot,
                path: "/agents/properties",
            },
            {
                name: "Handle Properties",
                Icon: faMapLocationDot,
                path: "/agents/my-listings",
            },
        ],
    },

    {
        name: "Enquiries",
        Icon: faEnvelope,
        subMenu: [
            {
                name: "Seller Inquiries",
                Icon: faEnvelope,
                path: "/agents/chat",
            },
            {
                name: "Buyer Inquiries",
                Icon: faEnvelope,
                path: "/agents/inquiries",
            },
        ],
    },
    {
        name: "Tripping",
        Icon: faCalendar,
        path: "/agents/trippings",
    },
    {
        name: "Sales",
        Icon: faChartSimple,
        path: "/agents/my-sales",
    },
    {
        name: "Transactions",
        Icon: faChartSimple,
        path: "/agents/my-sales",
    },
];


const Sidebar_animation = {
    open: {
        width: '18rem',
        transition: { duration: 0.3, ease: 'easeInOut' },
    },
    closed: {
        width: '6rem',
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
                className="bg-white border-r border-gray-100 h-screen z-[999] overflow-hidden md:relative fixed"
                variants={Sidebar_animation}
                animate={isOpen ? 'open' : 'closed'}
                initial={false}
            >
                {/* Logo */}
                <div
                    className={classNames(
                        'flex items-center py-3.5 border-slate-200',
                        isOpen ? 'px-2 justify-start gap-3' : 'px-6 justify-center'
                    )}
                >
                    <Link href="/">
                        <img src={logo} width={40} alt="Logo" />
                    </Link>
                    {isOpen && (
                        <span className="text-xl font-semibold text-green-700">MJVI Realty</span>
                    )}
                </div>

                {/* Section Title */}
                {isOpen && (
                    <p className="pl-6 text-xs font-bold text-gray-500 uppercase">Navigation</p>
                )}

                {/* Menu */}
                <ul className="px-3 py-5 flex flex-col gap-1 text-sm font-medium overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 md:h-[88%] h-[90%]">
                    {menus.map(({ name, Icon, path, subMenu }, i) => {
                        const isClicked = clicked === i;
                        const hasSubMenu = subMenu?.length > 0;

                        // Highlight menu if current URL matches parent or any of its submenus
                        const isActiveParent =
                            url.startsWith(path) || subMenu?.some((item) => url.startsWith(item.path));

                        return (
                            <React.Fragment key={name}>
                                <li className="relative">
                                    {/* Main Link or Toggle Button */}
                                    {path && !hasSubMenu ? (
                                        <Link
                                            href={path}
                                            className={classNames(
                                                isActiveParent
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'text-gray-500 hover:bg-green-50 hover:text-green-700',
                                                isOpen ? 'px-2' : 'px-6',
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
                                                isActiveParent
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'text-gray-500 hover:bg-green-50 hover:text-green-700',
                                                isOpen ? 'px-2' : 'px-6',
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
                                        className="pl-10 text-gray-500 text-sm font-normal"
                                    >
                                        {subMenu.map(({ name: subName, Icon: SubIcon, path: subPath }) => (
                                            <li key={subName}>
                                                <Link
                                                    href={subPath}
                                                    className={classNames(
                                                        url.startsWith(subPath)
                                                            ? 'text-green-600 bg-green-50'
                                                            : 'hover:text-green-600 hover:bg-gray-50',
                                                        'flex items-center gap-2 py-2 px-3 rounded-md transition-all'
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
