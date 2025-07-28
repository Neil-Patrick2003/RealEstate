import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, LogOut, X, Bell } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useMediaQuery } from 'react-responsive';
import Dropdown from '@/Components/Dropdown';
import Breadcrumb from '@/Components/Breadcrumbs';
import FlashMessage from '@/Components/FlashMessage.jsx';
import Drawer from "@/Components/Drawer.jsx";
import AgentSidebar from "@/Components/Sidebar/AgentSidebar.jsx";
import Echo from 'laravel-echo';

export default function AgentLayout({ children }) {
    const { auth } = usePage().props;

    // Notification state management
    const [notifications, setNotifications] = useState(auth?.notifications?.all ?? []);
    const [unreadNotifications, setUnreadNotifications] = useState(auth?.notifications?.unread ?? []);
    const [openDrawer, setOpenDrawer] = useState(false);

    // Sidebar state
    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('sidebar-isOpen');
        return saved ? JSON.parse(saved) : false;
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    // Persist sidebar state
    useEffect(() => {
        localStorage.setItem('sidebar-isOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    // Mobile handling
    useEffect(() => {
        if (!isMobile) setIsMobileOpen(false);
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    }, [isMobile, isMobileOpen]);

    // Mark notification as read
    const markAsRead = async (id) => {
        try {
            await router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        unreadNotifications.forEach(notif => markAsRead(notif.id));
    };

    // Real-time notifications setup
    useEffect(() => {
        if (!auth?.user?.id) return;

        const echo = new Echo({
            broadcaster: 'reverb',
            key: process.env.VITE_REVERB_APP_KEY,
            wsHost: process.env.VITE_REVERB_HOST,
            wsPort: process.env.VITE_REVERB_PORT,
            forceTLS: false,
            enabledTransports: ['ws', 'wss']
        });

        echo.private(`App.Models.User.${auth.user.id}`)
            .notification((notification) => {
                console.log('Real-time notification:', notification);
                setNotifications(prev => [...prev, notification]);
                setUnreadNotifications(prev => [...prev, notification]);
            });

        return () => {
            echo.leave(`App.Models.User.${auth.user.id}`);
        };
    }, [auth?.user?.id]);

    return (
        <div className="h-screen flex overflow-hidden relative">
            {/* Desktop Sidebar */}
            {!isMobile && (
                <div className="hidden md:block">
                    <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
            )}

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.4 }}
                            className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-2xl border-r rounded-tr-2xl rounded-br-2xl"
                        >
                            <AgentSidebar isOpen={true} setIsOpen={setIsMobileOpen} />
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

            {/* Main Content */}
            <main className="flex-1 h-full overflow-auto pt-14">
                {/* Header */}
                <motion.header
                    initial={false}
                    animate={{
                        marginLeft: isMobile ? 0 : isOpen ? '18rem' : '5rem',
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white px-6 py-3 z-50 shadow-sm"
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                            aria-label="Toggle sidebar"
                        >
                            <AlignLeft size={20} className="text-gray-500" />
                        </button>
                        <input
                            type="search"
                            placeholder="Search..."
                            className="hidden md:block ml-3 w-72 border-0 bg-gray-100 rounded-md px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <div className="hover:bg-gray-100 p-2 rounded-full transition">
                                        <img src="https://purecatamphetamine.github.io/country-flag-icons/3x2/GB.svg" alt="GB" className="w-6 h-6" />
                                    </div>
                                </Dropdown.Trigger>
                                <Dropdown.Content width="48">
                                    <ul className="py-1 px-2 text-sm text-gray-700">
                                        <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">English</li>
                                        <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">Filipino</li>
                                    </ul>
                                </Dropdown.Content>
                            </Dropdown>
                            <button
                                onClick={() => setOpenDrawer(true)}
                                className="relative w-10 h-10 rounded-full hover:bg-gray-100"
                            >
                                <Bell size={24} className="text-gray-600" />
                                {unreadNotifications.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {unreadNotifications.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition">
                                    <img
                                        src="https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png"
                                        alt="Profile"
                                        className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-200"
                                    />
                                    <div className="hidden sm:block">
                                        <span className="text-sm font-medium text-gray-700">{auth.user.name}</span>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </Dropdown.Trigger>
                            <Dropdown.Content width="48">
                                <Dropdown.Link href={route('profile.edit')} className="hover:bg-gray-100">
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    className="hover:bg-gray-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Log Out</span>
                                        <LogOut size={18} className="text-gray-500" />
                                    </div>
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </motion.header>

                {/* Page Content */}
                <div className="pt-0 pb-4 md:pt-14 sm:p-6 lg:p-8">
                    <FlashMessage />
                    <Breadcrumb />
                    {children}
                </div>
            </main>

            {/* Notifications Drawer */}
            <Drawer title="Notifications" open={openDrawer} setOpen={setOpenDrawer}>
                <div className="p-4 space-y-6 max-h-[75vh] overflow-y-auto">
                    <div className="flex justify-between">
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    {unreadNotifications.length > 0 && (
                        <div>
                            <h3 className="text-md font-semibold mb-2 text-gray-800">Unread</h3>
                            <ul className="space-y-2">
                                {unreadNotifications.map(notif => (
                                    <li
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className="p-4 border rounded-md cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notif.data?.message || 'New notification'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="text-xs text-red-500 font-semibold">New</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h3 className="text-md font-semibold mb-2 text-gray-800">All Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 text-sm">No notifications</p>
                        ) : (
                            <ul className="space-y-2">
                                {notifications.map(notif => (
                                    <li
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`p-4 border rounded-md cursor-pointer transition ${notif.read_at ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`text-sm ${notif.read_at ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                                                    {notif.data?.message || 'New notification'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notif.read_at && (
                                                <span className="text-xs text-red-500 font-semibold">New</span>
                                            )}
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
