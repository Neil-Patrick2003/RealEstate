import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/SIdebar/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, Bell, Languages, LogOut, Moon, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useMediaQuery } from 'react-responsive';
import Dropdown from '@/Components/Dropdown';

export default function AdminLayout({ children }) {
  const auth = usePage().props.auth.user;
  const [isOpen, setIsOpen] = useState(() => {
    // Initialize from localStorage if available, else default false
    const saved = localStorage.getItem('sidebar-isOpen');
    return saved === null ? false : JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  
  const [isMobileOpen, setIsMobileOpen] = useState(false); // for mobile

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Optional: Close mobile drawer on route change or screen resize
  useEffect(() => {
    if (!isMobile) {
      setIsMobileOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="h-screen bg-gray-200 flex overflow-hidden relative">
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <div className="hidden md:block">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      )}

      {/* Sidebar for Mobile */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 z-50 w-64 h-full bg-white border"
          >
            <Sidebar isOpen={true} setIsOpen={setIsMobileOpen} />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay behind mobile sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="w-full h-full overflow-auto bg-gray-100">
        <header className="flex justify-between items-center border-b bg-gray-100 px-4 py-3">
          {/* Left side: toggle + search */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg border"
            >
              <AlignLeft />
            </button>

            {/* Search input: shown only on medium+ screens */}
            <input
              placeholder="Search"
              className="hidden md:block ml-3 w-72 border rounded-lg border-gray-200 px-3 py-1.5 text-sm"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Language, Theme, Notification */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Language Dropdown */}
              <Dropdown>
                <Dropdown.Trigger>
                  <div className="hover:bg-gray-200 p-2 rounded-full transition duration-200">
                    <Languages size={22} className="text-gray-600" />
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content>
                  <ul className="py-1 px-2 text-sm text-gray-700">
                    <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">English</li>
                    <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer">Filipino</li>
                  </ul>
                </Dropdown.Content>
              </Dropdown>

              {/* Theme Toggle */}
              <div className="hover:bg-gray-200 p-2 rounded-full transition duration-200 cursor-pointer">
                <Moon size={20} className="text-gray-600" />
              </div>

              {/* Notification */}
              <div className="hover:bg-gray-200 p-2 rounded-full transition duration-200 cursor-pointer">
                <Bell size={20} className="text-gray-600" />
              </div>
            </div>

            {/* User Dropdown */}
            <div className="flex items-center gap-2">
              <Dropdown>
                <Dropdown.Trigger>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition">
                    <img
                      src="https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png"
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {auth?.name}
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Dropdown.Trigger>

                <Dropdown.Content>
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
          </div>

        </header>

        <div className='p-2 md:p-3 lg:p-4 xl:p-6 sl:p-8'>
          {children}
        </div>
        
      </main>
    </div>
  );
}
