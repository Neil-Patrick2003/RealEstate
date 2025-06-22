
import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/SIdebar/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, Bell, Languages, LogOut, Moon, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useMediaQuery } from 'react-responsive';
import Dropdown from '@/Components/Dropdown';
import { faBell, faMoon, faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Breadcrumb from '@/Components/Breadcrumbs';


export default function AuthenticatedLayout({ children }) {
  const auth = usePage().props.auth.user;

  // Sidebar open state (desktop)
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-isOpen');
    return saved === null ? false : JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  // Sidebar open state (mobile)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Close mobile sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <div className="hidden md:block">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      )}

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white border shadow-lg"
              role="dialog"
              aria-modal="true"
            >
              <Sidebar isOpen={true} setIsOpen={setIsMobileOpen} />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2"
                aria-label="Close sidebar"
              >
                <X size={24} />
              </button>
            </motion.div>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black opacity-30"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="w-full h-full overflow-auto pt-14 border"> {/* Add top padding for fixed header */}
          <header
            className={`fixed top-0 left-0 right-0 flex justify-between items-center border-b bg-white backdrop-blur-sm px-4 py-3 z-50 transition-all duration-300
              ${
                // If mobile and sidebar open, no ml because sidebar overlays content
                isMobile ? 'ml-0' : isOpen ? 'ml-[18rem]' : 'ml-[6rem]'
              }
            `}
          >
         {/* Left: Sidebar toggle + Search */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg border"
              aria-label="Toggle sidebar"
            >
              <AlignLeft size={16}  className='text-gray-400'/>
            </button>

            {/* Search input visible md+ */}
            <input
              type="search"
              id='search_all'
              placeholder="Search"
              className="hidden md:block ml-3 w-72 border rounded-lg border-gray-200 px-3 py-1.5 text-sm"
              aria-label="Search"
            />
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3">
              {/* Language Dropdown */}
              <Dropdown>
                <Dropdown.Trigger>
                  <div className="hover:bg-gray-200 p-2 rounded-full transition duration-200" aria-haspopup="true" aria-expanded="false" role="button">
                    <FontAwesomeIcon icon={faLanguage} className='text-gray-400 w-6 h-5' />
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Content width="48">
                  <ul className="py-1 px-2 text-sm text-gray-700" role="menu">
                    <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer" role="menuitem">English</li>
                    <li className="hover:bg-gray-100 rounded px-2 py-1 cursor-pointer" role="menuitem">Filipino</li>
                  </ul>
                </Dropdown.Content>
              </Dropdown>

              {/* Theme toggle */}
              <div className="hover:bg-gray-200 p-2 rounded-full transition duration-200 cursor-pointer" role="button" aria-label="Toggle theme">
                <FontAwesomeIcon icon={faMoon} className='text-gray-400 w-6 h-5' />
              </div>

              {/* Notification */}
              <div className="hover:bg-gray-200 p-2 rounded-full transition duration-200 cursor-pointer" role="button" aria-label="Notifications">
                {/* <Bell size={20} className="text-gray-600" /> */}
                <FontAwesomeIcon icon={faBell} className='text-gray-400 w-6 h-5' />
              </div>
            </div>

            {/* User Dropdown */}
            <Dropdown>
              <Dropdown.Trigger>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-lg transition" aria-haspopup="true" aria-expanded="false" role="button">
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

              <Dropdown.Content width="48">
                <Dropdown.Link href={route('profile.edit')} className="px-4 py-2 hover:bg-gray-100" role="menuitem">
                  Profile
                </Dropdown.Link>
                <Dropdown.Link
                  href={route('logout')}
                  method="post"
                  as="button"
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                  role="menuitem"
                >
                  <span>Log Out</span>
                  <LogOut size={18} className="text-gray-500" />
                </Dropdown.Link>
              </Dropdown.Content>
            </Dropdown>
          </div>
        </header>

        {/* Content wrapper with padding */}
        <div className="p-2 md:p-4 lg:p-6 xl:p-8 sl:p-8 mt-2">
          <Breadcrumb/>
          {children}
        </div>
      </main>
    </div>
  );
}
