import React from 'react'
import framer_logo from '../../assets/framer_logo.png'
import  { Menus } from '../utils';
import DesktopMenu from '@/Components/DestopMenu';
import MobMenu from '@/Components/MobMenu';
import { motion } from 'framer-motion';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import i18n from '../../i18n';
import { useState } from 'react';
import { CircleUser, Languages } from 'lucide-react';


const NavBar = () => {
    const auth = usePage().props.auth;
                             


    const { t } = useTranslation();
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

    const handleChangeLanguage = (lang, langLabel) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to switch to ${langLabel}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, switch',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
            i18n.changeLanguage(lang);
            Swal.fire({
                icon: 'success',
                title: 'Switched!',
                text: `Language changed to ${langLabel}.`,
                timer: 1500,
                showConfirmButton: false,
            });
            }
        });
    };
  return (
    <>
        <header className='h-16 text-[15px] fixed inset-0 flex-center bg-[#5c7934]'>
            <nav className='px-3.5 flex-center-between w-full mx-w-7xl mx-auto'>
                <div className='flex-center gap-x-3'>
                    <img src={framer_logo} alt='logo' className='size-8'/>
                    <h3 className='text-white text-lg font-semibold'>MJVI Realty</h3>
                </div>

                {/* menus */}



                {/* desktop menu */}
                <ul className='lg:flex-center hidden gap-x-1'>
                    { Menus.map( (menu) => (
                        <DesktopMenu menu={menu} key={menu.name}/>
                    ) ) }
                </ul>
                <div className=' flex-center gap-x-5'>
                    <motion.div
                        className="hidden lg:block relative"
                        onHoverStart={() => setIsHover(true)}
                        onHoverEnd={() => setIsHover(false)}
                    >
                        <button className="border z-[999] text-white relative px-3 py-1.5 shadow rounded-xl flex-center">
                            <Languages size={12} className="mr-2" />
                            <span>{t('Language')}</span>
                        </button>

                        <motion.div
                            className="absolute top-[4.2rem] p-[15px] rounded-[6px] origin-[50%_-170px] bg-white"
                            initial="exit"
                            animate={isHover ? "enter" : "exit"}
                            variants={languageAnimate}
                        >
                            <div className="cursor-pointer hover:bg-green-400 hover:text-white px-2 py-1">
                                <button onClick={() => handleChangeLanguage('fil', 'Filipino')}>
                                    <img src="https://flagcdn.com/ph.svg" alt="Filipino Flag" className="inline-block mr-2 w-6 h-6" />
                                    <span>Filipino</span>
                                </button>
                            </div>
                            <div className="cursor-pointer hover:bg-green-400 hover:text-white px-2 py-1">
                                <button onClick={() => handleChangeLanguage('en', 'English')}>
                                    <img src="https://flagcdn.com/us.svg" alt="English Flag" className="inline-block mr-2 w-6 h-6" />
                                    <span>English</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {auth?.user ? (
                        <div className='flex gap-1 bg-[#e0b52b] px-3 py-2 shadow rounded-xl items-center text-white'>
                            <CircleUser size={22} className='text-white '/>
                            <span className='text-white'>{auth.user.name}</span>
                        </div>
                            
                       
                        
                    ): (
                        <Link href={route('login')} className='bg-[#e0b52b] z-[999] relative px-3 py-1.5 text-white shadow rounded-xl flex-center'>{t('Login')}</Link>
                    )}

                    
                    <div className='lg:hidden'>
                        <MobMenu Menus={Menus}/>
                    </div>
                </div>
                
                
            </nav>
        </header>
    </>
  )
}

export default NavBar