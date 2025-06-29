import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, LogOut, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useMediaQuery } from 'react-responsive';
import Dropdown from '@/Components/Dropdown';
import { faBell, faMoon, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Breadcrumb from '@/Components/Breadcrumbs';
import FlashMessage from "@/Components/FlashMessage.jsx";

export default function AuthenticatedLayout({ children }) {
  const auth = usePage().props.auth.user;

  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-isOpen');
    return saved === null ? false : JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    if (!isMobile) setIsMobileOpen(false);
  }, [isMobile]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
  }, [isMobileOpen]);

  return (
    <div className="h-screen flex overflow-hidden relative bg-gray-50">
      {!isMobile && (
        <div className="hidden md:block">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      )}

      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-2xl border-r rounded-tr-2xl rounded-br-2xl"
              role="dialog"
              aria-modal="true"
            >
              <Sidebar isOpen={true} setIsOpen={setIsMobileOpen} />
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
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
          </>
        )}
      </AnimatePresence>

      <main className="w-full h-full overflow-auto pt-14">
        <motion.header
          initial={false}
          animate={{
            marginLeft: isMobile ? 0 : isOpen ? '18rem' : '5rem',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white border-b shadow-sm px-6 py-3 z-50"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg border bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition"
              aria-label="Toggle sidebar"
            >
              <AlignLeft size={20} className="text-gray-500" />
            </button>
            <input
              type="search"
              id="search_all"
              placeholder="Search anything..."
              className="hidden md:block ml-3 w-72 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-100 focus:outline-none transition"
              aria-label="Search"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3">
              <Dropdown>
                <Dropdown.Trigger>
                  <div className="hover:bg-gray-100 p-2 rounded-full transition" role="button">
                    <FontAwesomeIcon icon={faLanguage} className="text-gray-500 w-5 h-5" />
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content width="48">
                  <ul className="py-1 px-2 text-sm text-gray-700">
                    <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">English</li>
                    <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">Filipino</li>
                  </ul>
                </Dropdown.Content>
              </Dropdown>
              <div className="hover:bg-gray-100 p-2 rounded-full transition cursor-pointer" role="button">
                <FontAwesomeIcon icon={faMoon} className="text-gray-500 w-5 h-5" />
              </div>
              <div className="hover:bg-gray-100 p-2 rounded-full transition cursor-pointer" role="button">
                <FontAwesomeIcon icon={faBell} className="text-gray-500 w-5 h-5" />
              </div>
            </div>

            <Dropdown>
              <Dropdown.Trigger>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition" role="button">
                  <img
                    src="https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png"
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-200"
                  />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">{auth?.name}</span>
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

        <div className="p-4 sm:p-6 md:p-8 mt-4">
            <FlashMessage/>
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
