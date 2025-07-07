import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar/SellerSidebar.jsx';
import AgentSidebar from '@/Components/Sidebar/AgentSidebar.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, LogOut, X, Bell } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useMediaQuery } from 'react-responsive';
import Dropdown from '@/Components/Dropdown';
import Breadcrumb from '@/Components/Breadcrumbs';
import FlashMessage from '@/Components/FlashMessage.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLanguage,
    faMoon,
} from '@fortawesome/free-solid-svg-icons';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const { notifications = [], user } = auth;

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

    const markAsRead = (id) =>
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });

    return (
        <div className="h-screen flex overflow-hidden relative">
            {/* Sidebar */}
            {!isMobile && (
                <div className="hidden md:block">
                    <AgentSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
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
                            <AgentSidebar
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
                    transition={{ duration: 0.3 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded border bg-gray-50 hover:bg-gray-100"
                            aria-label="Toggle sidebar"
                        >
                            <AlignLeft size={20} className="text-gray-500" />
                        </button>
                        <input
                            type="search"
                            placeholder="Search..."
                            className="hidden md:block ml-4 border rounded px-3 py-2 text-sm focus:ring focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <FontAwesomeIcon icon={faLanguage} className="text-gray-500 w-5 h-5 p-2 hover:bg-gray-100 rounded-full" />
                            </Dropdown.Trigger>
                            <Dropdown.Content width="auto">
                                <ul className="text-sm text-gray-700">
                                    <li className="hover:bg-gray-100 cursor-pointer px-3 py-1">English</li>
                                    <li className="hover:bg-gray-100 cursor-pointer px-3 py-1">Filipino</li>
                                </ul>
                            </Dropdown.Content>
                        </Dropdown>

                        {/* Theme */}
                        <button className="p-2 hover:bg-gray-100 rounded-full transition">
                            <FontAwesomeIcon icon={faMoon} className="text-gray-500 w-5 h-5" />
                        </button>

                        {/* Notifications */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <Bell className="text-gray-500 w-5  hover:bg-gray-100 rounded-full" />
                                {notifications.some(n => !n.read_at) && (
                                    <span className="absolute top-2 right-2 block w-2 h-2 rounded-full bg-red-500" />
                                )}
                            </Dropdown.Trigger>
                            <Dropdown.Content width="80">
                                <div className="max-h-64 overflow-y-auto p-2">
                                    {notifications.length === 0 && (
                                        <p className="text-center text-gray-500 text-sm">No notifications</p>
                                    )}
                                    {notifications.map(n => {
                                        const date = new Date(n.created_at).toLocaleString();
                                        return (
                                            <div
                                                key={n.id}
                                                className="flex justify-between items-center py-2 border-b last:border-none"
                                            >
                                                <span className={n.read_at ? 'text-gray-700' : 'font-medium'}>
                                                  {n.data.message}
                                                </span>
                                                <div className="text-xs text-gray-400 text-right">
                                                    {date}
                                                    {!n.read_at && (
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            className="ml-2 text-blue-500 hover:underline"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Dropdown.Content>
                        </Dropdown>

                        {/* User profile */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <div className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg">
                                    <img
                                        src={user.profile_photo_url || '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-9 h-9 rounded-full"
                                    />
                                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                                    {user.name}
                                  </span>
                                </div>
                            </Dropdown.Trigger>
                            <Dropdown.Content width="48">
                                <Dropdown.Link href={route('profile.edit')} className="block px-4 py-2 hover:bg-gray-100">
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex justify-between px-4 py-2 hover:bg-gray-100 w-full"
                                >
                                    Logout <LogOut size={18} />
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </motion.header>

                {/* Body */}
                <div className="pt-14 p-4 sm:p-6 lg:p-8">
                    <FlashMessage />
                    <Breadcrumb />
                    {children}
                </div>
            </main>
        </div>
    );
}
