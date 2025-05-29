import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/SIdebar/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, Bell, LogOut, Moon, X } from 'lucide-react';
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
      <main className="w-full h-full overflow-auto bg-gray-50">
        <header className="flex justify-between items-center border-b mb-2  bg-white px-4 py-2">
          <div className='flex'>
            <button
              onClick={toggleSidebar}
              className="p-2 bg-white rounded-lg border "
            >
              <AlignLeft />
            </button>
            
            <input placeholder='Search' className='ml-3 w-80  border rounded-lg border-gray-200' />

            
            
          </div>
          
          <div className='flex-center gap-3'>
            <div className='border p-2.5 rounded-full'>
              <Moon />
            </div>
            <div className='border p-2.5 rounded-full'>
              <Bell />
            </div>
            <div className='flex-center gap-x-1'>
             
            
              <Dropdown>
                <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md border gap-1 border-transparent pr-2 bg-white  text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                           <img src='https://www.pngitem.com/pimgs/m/404-4042710_circle-profile-picture-png-transparent-png.png' className='w-12 h-12'/>
                            {auth && auth.name}

                            <svg
                                className="-me-0.5 ms-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </span>
                </Dropdown.Trigger>

                <Dropdown.Content>
                    <Dropdown.Link
                        href={route('profile.edit')}
                    >
                        Profile
                    </Dropdown.Link>
                    <Dropdown.Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className='flex-center-between'
                    >
                      <span>
                        Log Out
                      </span>
                      <LogOut size={20} className='text-gray-500' />
                        
                        
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
