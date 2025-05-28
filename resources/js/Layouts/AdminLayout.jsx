import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/SIdebar/sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AlignLeft, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useMediaQuery } from 'react-responsive';

export default function AdminLayout({ children }) {
  const auth = usePage().props.auth.user;
  const [isOpen, setIsOpen] = useState(true); // for desktop
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
        <header className="flex justify-between items-center border-b mb-2 bg-white p-4 ">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-white rounded"
          >
            <AlignLeft />
          </button>
          <div>{auth.name}</div>
        </header>
        <div className=''>
          {children}
        </div>
        
      </main>
    </div>
  );
}
