import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, LogOut, X, Bell } from 'lucide-react';
import {Link, router, usePage} from '@inertiajs/react';
import { useMediaQuery } from 'react-responsive';
import Dropdown from '@/Components/Dropdown';
import Breadcrumb from '@/Components/Breadcrumbs';
import FlashMessage from '@/Components/FlashMessage.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLanguage,
    faMoon,
} from '@fortawesome/free-solid-svg-icons';
import SellerSidebar from "@/Components/Sidebar/SellerSidebar.jsx";
import Drawer from "@/Components/Drawer.jsx";

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;

    const [notifications, setNotifications] = useState(auth?.notifications?.all ?? []);
    const [unreadNotifications, setUnreadNotifications] = useState(auth?.notifications?.unread ?? []);

    const [ openDrawer, setOpenDrawer ] = useState(false);

    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('sidebar-isOpen');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('sidebar-isOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    const toggleSidebar = () =>
        isMobile ? setIsMobileOpen(!isMobileOpen) : setIsOpen(!isOpen);

    useEffect(() => {
        if (!isMobile) setIsMobileOpen(false);
    }, [isMobile]);

    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    }, [isMobileOpen]);

    const markAsRead = (id) => {
        router.post(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setUnreadNotifications(prev =>
                    prev.filter(notif => notif.id !== id)
                );
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
                    )
                );
            },
            onError: (error) => {
                console.error('Error marking notification as read:', error);
            }
        });
    };

    const markAllAsRead = () => {
        unreadNotifications.forEach(notif => markAsRead(notif.id));
    };

    useEffect(() => {
        Echo.private(`App.Models.User.${auth.user.id}`)
            .notification((notification) => {
                console.log('Real-time NOTIFICATION: ', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadNotifications(prev => [notification, ...prev]);
            });

        return () => {
            Echo.leave(`App.Models.User.${auth.user.id}`);
        };
    }, [auth.user.id]);

    return (
        <div className="h-screen flex overflow-hidden relative">
            {/* Sidebar */}
            {!isMobile && (
                <div className="hidden md:block">
                    <SellerSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
            )}

            {/* Mobile sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.4 }}
                            className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-2xl border-r rounded-tr-2xl rounded-br-2xl"
                            role="dialog"
                        >
                            <SellerSidebar
                                isOpen={true}
                                setIsOpen={setIsMobileOpen}
                            />
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800"
                                aria-label="Close sidebar"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => setIsMobileOpen(false)}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="flex-1 h-full overflow-auto pt-14">
                <motion.header
                    initial={false}
                    animate={{
                        marginLeft: isMobile ? 0 : isOpen ? '18rem' : '5rem',
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white px-6 py-3 z-50"
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg border-0 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition"
                            aria-label="Toggle sidebar"
                        >
                            <AlignLeft size={20} className="text-gray-500" />
                        </button>
                        <input
                            type="search"
                            id="search_all"
                            placeholder="Search anything..."
                            className="hidden md:block ml-3 w-72 border-0 bg-gray-100 rounded-md px-3 py-2 text-sm "
                            aria-label="Search"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="hover:bg-gray-100 p-2 rounded-full transition" role="button">
                                        <img loading="lazy" alt="GB" className="w-6 h-6"
                                             src="https://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg" />
                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="48">
                                    <ul className="py-1 px-2 text-sm text-gray-700">
                                        <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">English</li>
                                        <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">Filipino</li>
                                    </ul>
                                </Dropdown.Content>
                            </Dropdown>

                            <div
                                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition cursor-pointer"
                                role="button"
                                aria-label="Notifications"
                            >
                                <button onClick={() => setOpenDrawer(true)} className="relative w-10 h-10 rounded-full">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        className="w-6 h-6 text-gray-600"
                                        aria-hidden="true"
                                    >
                                        <path
                                            opacity="0.4"
                                            d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.8 25.8 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.4 4.4 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7"
                                        />
                                        <path d="M12.75 6a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0" />
                                    </svg>

                                    {unreadNotifications.length > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                            {unreadNotifications.length}
                                        </span>
                                    )}
                                </button>

                            </div>


                        </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition"
                                    role="button">
                                    <img
                                        src="https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png"
                                        alt="Profile"
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-200"
                                    />
                                    <span className="hidden sm:inline text-sm font-medium text-gray-700">{auth?.user?.name || 'Guest'}</span>
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </Dropdown.Trigger>
                            <Dropdown.Content width="48">
                                <Dropdown.Link href={route('profile.edit')} className="px-4 py-2 hover:bg-gray-100">
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                                >
                                    <span>Log Out</span>
                                    <LogOut size={18} className="text-gray-500" />
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>

                </motion.header>

                {/* Body */}
                <div className="pt-14 sm:p-6 lg:p-8">
                    <FlashMessage />
                    <Breadcrumb />
                    {children}
                </div>
            </main>
            <Drawer title="Notifications" setOpen={setOpenDrawer} open={openDrawer}>
                <div className="py-4  border space-y-6 max-h-[75vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
                    </div>

                    {unreadNotifications.length > 0 && (
                        <div>
                            <h3 className="text-md font-semibold mb-2 text-gray-800">Unread</h3>
                            <ul className="space-y-2">
                                {unreadNotifications.map((notif) => (
                                    <li key={notif.id}
                                        // onClick={() => markAsRead(notif.id)}
                                        className="rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 transition">

                                        <div
                                            className="notification-item p-4 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="flex items-start">
                                                <div className="shrink-0 p-2 bg-blue-100 rounded-full">
                                                    <i className="fas fa-info-circle text-blue-500"></i>
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-medium text-gray-900">{notif?.data?.title || notif?.title }</p>
                                                        <span className="text-xs text-gray-500">{ notif?.data?.created_at || notif?.created_at }</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{notif?.data?.message || notif?.message} </p>
                                                    <div className="mt-2">
                                                        {notif?.link && (
                                                            <Link href={notif?.link} className="text-blue-500 hover:underline">View</Link>
                                                        )}

                                                        {notif?.data?.link && (
                                                            <Link href={notif?.data?.link} className="text-blue-500 hover:underline">View</Link>
                                                        )}
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                                <span className="text-xs text-accent">New</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h3 className="text-md font-semibold mb-2 text-gray-800">All Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 text-sm">You have no notifications.</p>
                        ) : (
                            <ul className="border space-y-2">

                                {notifications.map((notif) => (

                                    <li key={notif.id}
                                        className={`rounded-md cursor-pointer transition group ${notif.read_at === null ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white hover:bg-gray-50'}`}>

                                        <div
                                            className="notification-item p-4 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="flex items-start">
                                                <div className="shrink-0 p-2 bg-blue-100 rounded-full">
                                                    <i className="fas fa-info-circle text-blue-500"></i>
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-medium text-gray-900">{notif?.data?.title}</p>
                                                        <span className="text-xs text-gray-500">{notif.created_at}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{notif?.data?.message}</p>
                                                    <div className="mt-2">
                                                        {notif?.data?.link && (
                                                            <Link href={notif?.data?.link} className="text-blue-500 hover:underline">View</Link>
                                                        ) }
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>

                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
