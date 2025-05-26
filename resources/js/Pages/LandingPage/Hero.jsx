import React, { useState } from 'react'
import framer_logo from '../../../assets/framer_logo.png'
import  { Menus } from '../../utils';
import DesktopMenu from '@/Components/DestopMenu';
import MobMenu from '@/Components/MobMenu';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    const [ isHover, setIsHover] = useState(false);

    const toggleHoverLanguage = () => {
        setIsHover(!isHover);
    }

    const languageAnimate = {
         enter: {
            opacity: 1,
            rotateX: 0,
            transition: {
                duration: 0.3 
            },
            display: "block"

        },
        exit: {
            opacity: 0,
            rotateX: -15,
            transition: {
                duration: 0.3,
            },
            display: "none",
        }
    }
 
  return (
    
    <div>
        <header className='h-16 text-[15px] fixed inset-0 flex-center bg-green-800'>
            <nav className='px-3.5 flex-center-between w-full mx-w-7xl mx-auto'>
                <div className='flex-center gap-x-3'>
                    <img src={framer_logo} alt='logo' className='size-8'/>
                    <h3 className='text-whitetext-lg font-semibold'>MJVI Realty</h3>
                </div>

                {/* menus */}



                {/* desktop menu */}
                <ul className='lg:flex-center hidden gap-x-1'>
                    { Menus.map( (menu) => (
                        <DesktopMenu menu={menu} key={menu.name}/>
                    ) ) }
                </ul>
                <div className='flex-center gap-x-5'>
                    
                        <motion.div
                            className=""
                            onHoverStart={() => setIsHover(true)}
                            onHoverEnd={() => setIsHover(false)}
                        >
                            <button className="bg-white/5 z-[999] relative px-3 py-1.5 shadow rounded-xl flex-center">
                            <Languages size={12} className="mr-2" />
                            <span>Language</span>
                            </button>

                            <motion.div
                            className="absolute top-[4.2rem] p-[15px] rounded-[6px] origin-[50%_-170px] backdrop-blur bg-white/[0.04]"
                            initial="exit"
                            animate={isHover ? "enter" : "exit"}
                            variants={languageAnimate}
                            >
                            <div className="cursor-pointer hover:bg-white/5 px-2 py-1">Filipino</div>
                            <div className="cursor-pointer hover:bg-white/5 px-2 py-1">English</div>
                            </motion.div>
                        </motion.div>
                    

                    <button className='bg-white/5 z-[999] relative px-3 py-1.5 shadow rounded-xl flex-center'>Sign In</button>
                    <div className='lg:hidden'>
                        <MobMenu Menus={Menus}/>
                    </div>
                </div>
                
                
            </nav>
        </header>
    </div>
  )
}

export default Hero