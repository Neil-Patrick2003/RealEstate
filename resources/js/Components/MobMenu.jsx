import React, { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobMenu({ Menus }) {
    const [isOpen, setIsOpen] = useState(false);
    const [clicked, setClicked]= useState(false);


    // toggle drawer
    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    }

    // toggle subMenu item
    const subMenuDrawer = {
        enter: {
            height: 'auto',
            overflow: "hidden",
        },
        exit: {
            height: 0,
            overflow: 'hidden',
        }
    }

    

  return (
    <div className='z-[999]'>
        <button 
        onClick={toggleDrawer}
        className='z-50 relative'
        >
            {isOpen ? <X /> : <Menu/>}
        </button>
        <motion.div 
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%"}}
        className='fixed left-0 right-0 top-16 overflow-y-auto h-full bg-[#18181A] backdrop-blur text-white p-16'
        >
            <ul>
                {Menus?.map(({name, subMenu}, i) => {
                    // checking if menu exist
                    const hasSubMenu = subMenu?.length > 0;
                    // checking if the menu is clicked
                    const isclicked = clicked === i;
                    return (
                        <li key={name}>
                            <span
                             className='flex-center-between p-4 hover:bg-white/5 rounded-md cursor-pointer relative'
                            //  toggle submenu item open
                             onClick={() => setClicked(isclicked ? null : i)}
                             >
                                {name}
                            </span>
                            { hasSubMenu && (
                                <motion.ul 
                                className='ml-5'
                                initial= "exit"
                                animate= { isclicked ? "enter" : "exit"}
                                variants={subMenuDrawer}
                                >
                                    {subMenu?.map(({name,icon : Icon}) => (
                                        <li key={name} className='p-2 flex-center hover:bg-white/5 rounded-md cursor-pointer gap-x-2'>
                                            <Icon size={17}/>
                                            <span>{name}</span>
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </li>
                        
                        
                    );
                })}
                <li>
                    Dashboard
                </li>
            </ul>
        </motion.div>
    </div>
  )
}
