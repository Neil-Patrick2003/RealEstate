import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import logo from '../../../assets/framer_logo.png';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faMapLocationDot,
    faEnvelope,
    faCalendar,
    faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ isOpen, setIsOpen }) => {
    const [clicked, setClicked] = useState(null);
    const { url } = usePage();

    const Sidebar_animation = {
        open: {
            width: "18rem",
            transition: { type: "spring", damping: 20, stiffness: 300 },
        },
        closed: {
            width: "5rem",
            transition: { type: "spring", damping: 20, stiffness: 300 },
        },
    };

    const subMenuDrawer = {
        enter: { height: "auto", opacity: 1, overflow: "hidden", transition: { duration: 0.2 } },
        exit: { height: 0, opacity: 0, overflow: "hidden", transition: { duration: 0.2 } },
    };

    const menus = [
        {
            name: "Dashboard",
            Icon: faHouse,
            path: "/dashboard",
        },
        {
            name: "Properties",
            Icon: faMapLocationDot,
            path: "/properties",
        },
        {
            name: "Enquiries",
            Icon: faEnvelope,
            subMenu: [
                {
                    name: "Messages",
                    Icon: faEnvelope,
                    path: "/messages",
                },
                {
                    name: "Inquiries",
                    Icon: faEnvelope,
                    path: "/inquiries",
                },
            ],
        },
        {
            name: "Tripping",
            Icon: faCalendar,
            path: "/trippings",
        },
        {
            name: "Sales",
            Icon: faChartSimple,
            path: "/my-sales",
        },
    ];

    return (
        <div className="flex">
            <motion.div
                className="bg-white shadow-md border-r h-screen z-[999] overflow-hidden md:relative fixed"
                variants={Sidebar_animation}
                animate={isOpen ? "open" : "closed"}
                initial={false}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-200">
                    <Link href="/">
                        <img src={logo} width={40} alt="Logo" />
                    </Link>
                    {isOpen && <span className="text-xl font-semibold text-green-700">MJVI Realty</span>}
                </div>

                {/* Menu */}
                <ul className="px-3 py-5 flex flex-col gap-1 text-sm font-medium overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 md:h-[88%] h-[90%]">
                    {menus.map(({ name, Icon, path, subMenu }, i) => {
                        const isClicked = clicked === i;
                        const hasSubMenu = subMenu?.length > 0;

                        return (
                            <li key={name} className="relative">
                                {/* Top-level item */}
                                {path && !hasSubMenu ? (
                                    <Link
                                        href={path}
                                        className={classNames(
                                            url.startsWith(path)
                                                ? "bg-green-100 text-green-700"
                                                : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                                            "flex items-center gap-3 px-5 py-3 rounded-lg transition-all"
                                        )}
                                    >
                                        <FontAwesomeIcon icon={Icon} className="w-5 h-5" />
                                        {isOpen && <span>{name}</span>}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setClicked(isClicked ? null : i)}
                                        className={classNames(
                                            "w-full flex items-center justify-between",
                                            "text-gray-600 hover:bg-green-50 hover:text-green-700 px-5 py-3 rounded-lg transition-all"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={Icon} className="w-5 h-5" />
                                            {isOpen && <span>{name}</span>}
                                        </span>
                                        {isOpen && hasSubMenu && (
                                            <ChevronDown
                                                className={`transition-transform ${isClicked ? "rotate-180" : ""}`}
                                                size={18}
                                            />
                                        )}
                                    </button>
                                )}

                                {/* Submenu */}
                                {hasSubMenu && (
                                    <motion.ul
                                        variants={subMenuDrawer}
                                        initial="exit"
                                        animate={isClicked ? "enter" : "exit"}
                                        className="pl-10 text-gray-500 text-sm font-normal"
                                    >
                                        {subMenu.map(({ name: subName, Icon: SubIcon, path: subPath }) => (
                                            <li key={subName}>
                                                <Link
                                                    href={subPath}
                                                    className={classNames(
                                                        url.startsWith(subPath)
                                                            ? "text-green-600 bg-green-50"
                                                            : "hover:text-green-600 hover:bg-gray-50",
                                                        "flex items-center gap-2 py-2 px-3 rounded-md transition-all"
                                                    )}
                                                >
                                                    {SubIcon && <FontAwesomeIcon icon={SubIcon} className="w-4 h-4" />}
                                                    {isOpen && <span>{subName}</span>}
                                                </Link>
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </motion.div>
        </div>
    );
};

export default Sidebar;
