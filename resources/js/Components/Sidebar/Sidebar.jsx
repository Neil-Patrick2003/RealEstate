import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, ChevronDown, Home, User, Settings } from 'lucide-react';
import logo from '../../../assets/framer_logo.png';
import { Link } from '@inertiajs/react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [clicked, setClicked] = useState(null);

  const Sidebar_animation = {
    open: {
      width: "18rem",
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    closed: {
      width: "6rem",
      transition: { type: "spring", damping: 20, stiffness: 300 }
    }
  };

  const subMenuDrawer = {
    enter: { height: 'auto', overflow: "hidden" },
    exit: { height: 0, overflow: 'hidden' }
  };

  const menus = [
    {
      name: "Dashboard",
      Icon: Home,
      path: "/dashboard"
    },
    {
      name: "Settings",
      Icon: Settings,
      path: "/settings",
      subMenu: [
        { name: "Profile Settings", Icon: User, path: "/settings/profile" },
        { name: "Account Settings", Icon: Settings, path: "/settings/account" }
      ]
    }
    
    
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <motion.div 
        className="bg-white text-gray  z-[999] h-screen overflow-hidden md:relative fixed"
        variants={Sidebar_animation}
        animate={isOpen ? "open" : "closed"}
      >
        {/* Logo */}
        <div className="px-6">
            <div className="flex items-center gap-2 font-medium border-b border-slate-300 py-3 mx-auto max-w-xs">
                <img src={logo} width={45} alt="Logo" />
                {isOpen && <span className="text-xl">MJVI Realty</span>}
            </div>
        </div>


        {/* Menu */}
        <ul className='px-4 py-5 border-r flex flex-col gap-1 font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100   md:h-[88%] h-[90%]'>
          {menus.map(({ name, Icon, path, subMenu }, i) => {
            const isClicked = clicked === i;
            const hasSubMenu = subMenu?.length > 0;

            return (
              <li key={name} className='px-4  py-4 rounded hover:bg-gray-100'>
                <div
                  className='flex  justify-center items-center gap-3 cursor-pointer'
                  onClick={() => setClicked(isClicked ? null : i)}
                >
                  <Icon size={23} className=''/>
                  {isOpen && (
                    <span className='flex justify-between w-full'>
                      <span>{name}</span>
                      {hasSubMenu && (
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${isClicked ? "rotate-180" : ""}`}
                        />
                      )}
                    </span>
                  )}
                </div>

                {/* Submenu */}
                {hasSubMenu && (
                  <motion.ul
                    className='ml-7  text-sm'
                    initial="exit"
                    animate={isClicked ? "enter" : "exit"}
                    variants={subMenuDrawer}
                  >
                    {subMenu.map(({ name, Icon, path }) => (
                      <li key={name} className='p-4'>
                        <Link
                          href={path}
                          className='flex items-center gap-2  hover:bg-gray-200 rounded'
                        >
                          <Icon size={17} />
                          {isOpen && <span>{name}</span>}
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
