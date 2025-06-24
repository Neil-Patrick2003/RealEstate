import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, 
} from 'lucide-react';
import logo from '../../../assets/framer_logo.png';
import { Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faMapLocationDot, faEnvelope, faCalendar, faChartSimple } from "@fortawesome/free-solid-svg-icons";


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [clicked, setClicked] = useState(null);
  const { url } = usePage();

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
      Icon: faHouse,
      path: "/dashboard"
    },
    {
      name: "Properties",
      Icon: faMapLocationDot,
      path: "/properties"
    },
    {
      name: "Enquiries",
      Icon: faEnvelope,
      path: "/messages"
    },
    {
      name: "Tripping",
      Icon: faCalendar,
      path: "/trippings"
    },
    {
      name: "Sales",
      Icon: faChartSimple,
      path: "/my-sales"
    },
    
  ];

  return (
    <div className="flex">
      <motion.div
        className="bg-white text-gray z-[999] h-screen overflow-hidden md:relative fixed"
        variants={Sidebar_animation}
        animate={isOpen ? "open" : "closed"}
        initial={false}
      >
        {/* Logo */}
        <div className="px-6">
          <div className="flex items-center gap-2 font-medium border-b border-slate-300 py-3 mx-auto max-w-xs">
            <Link href={'/'}>
              <img src={logo} width={45} alt="Logo" />
            </Link>
            
            {isOpen && <span className="text-xl">MJVI Realty</span>}
          </div>
        </div>

        {/* Menu */}
        <ul className='px-4 py-5 flex flex-col gap-1 font-medium overflow-x-hidden scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100 md:h-[88%] h-[90%]'>
          {menus.map(({ name, Icon, path, subMenu }, i) => {
            const isClicked = clicked === i;
            const hasSubMenu = subMenu?.length > 0;

            return (
              <li key={name}>
                {path ? (
                  <Link
                    href={path}
                    className={classNames(
                      url?.startsWith(path)
                        ? 'bg-green-200 text-green-700'
                        : 'text-gray-500 hover:bg-green-200 hover:text-green-700',
                      'flex items-center gap-x-3 px-5 py-4 rounded-md font-medium transition-all'
                    )}
                    onClick={() => setClicked(null)} // close submenu when navigating
                  >
                    <div className='flex justify-center items-center gap-3 cursor-pointer'>
                       <FontAwesomeIcon icon={Icon} className=" w-6 h-6" />
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
                  </Link>
                ) : (
                  <button
                    className={classNames(
                      'text-gray-400 hover:bg-green-50 hover:text-green-700',
                      'flex items-center gap-x-3 px-5 py-2 rounded-xl font-medium w-full text-left transition-all'
                    )}
                    onClick={() => setClicked(isClicked ? null : i)}
                  >
                    <Icon size={23} />
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
                  </button>
                )}

                {hasSubMenu && (
                  <motion.ul
                    className='ml-7 text-sm'
                    initial="exit"
                    animate={isClicked ? "enter" : "exit"}
                    variants={subMenuDrawer}
                  >
                    {subMenu.map(({ name, Icon, path }) => (
                      <li key={name} className='p-2'>
                        <Link
                          href={path}
                          className='flex items-center gap-2 hover:bg-gray-200 rounded px-2 py-1'
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
