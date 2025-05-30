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
import { CircleUser, Languages, Plus } from 'lucide-react';


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

   const handleChangeLanguage = (lang, langLabel) => 
    {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to switch to ${langLabel}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, switch',
            cancelButtonText: 'No, cancel',
            customClass: {
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 mr-3 rounded',
                cancelButton: 'bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                i18n.changeLanguage(lang);

                // Apply custom styles to the success alert too
                Swal.fire({
                    icon: 'success',
                    title: 'Switched!',
                    text: `Language changed to ${langLabel}.`,
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'bg-white rounded-lg shadow-lg' // optional styling
                    }
                });
            }
        });
    };

  return (
    <>
        <header className='h-16 text-[15px] fixed inset-0 flex-center bg-[#5c7934]'>
            <nav className='px-3.5 flex-center-between w-full mx-w-7xl mx-auto'>
                <Link href={'/'}>
                    <div className='flex-center gap-x-3'>
                        <img src={framer_logo} alt='logo' className='size-8'/>
                        <h3 className='hidden md:block text-white text-lg font-semibold'>MJVI Realty</h3>
                    </div>
                </Link>
                
                {/* menus */}

                {/* desktop menu */}
                <ul className='lg:flex-center hidden gap-x-1'>
                    { Menus.map( (menu) => (
                        <DesktopMenu menu={menu} key={menu.name}/>
                    ) ) }
                </ul>
                <div className="flex items-center gap-x-2">
                    {/* Authenticated User Dropdown */}
                    {auth?.user ? (
                        <motion.div
                        className="relative hidden lg:block"
                        onHoverStart={() => setIsHover(true)}
                        onHoverEnd={() => setIsHover(false)}
                        >
                        <button className="relative flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-xl shadow hover:bg-green-700 transition z-[999]">
                            <CircleUser size={20} />
                            <span className="font-medium">{auth.user.name}</span>
                        </button>

                        <motion.div
                            className="absolute top-[3.2rem] right-0 w-52 bg-white dark:bg-gray-800 border rounded-md shadow-md py-2 z-[998]"
                            initial="exit"
                            animate={isHover ? "enter" : "exit"}
                            variants={languageAnimate}
                        >
                            <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-gray-700 hover:bg-green-500 hover:text-white rounded-md transition"
                            >
                            Dashboard
                            </Link>

                            <div className="px-4 py-2 font-semibold text-sm text-gray-600">Language</div>

                            <button
                            onClick={() => handleChangeLanguage('fil', 'Filipino')}
                            className="flex items-center w-full px-4 py-2 hover:bg-green-500 hover:text-white transition"
                            >
                            <img src="https://flagcdn.com/ph.svg" alt="Filipino Flag" className="w-5 h-5 mr-2" />
                            Filipino
                            </button>

                            <button
                            onClick={() => handleChangeLanguage('en', 'English')}
                            className="flex items-center w-full px-4 py-2 hover:bg-green-500 hover:text-white transition"
                            >
                            <img src="https://flagcdn.com/us.svg" alt="English Flag" className="w-5 h-5 mr-2" />
                            English
                            </button>
                        </motion.div>
                        </motion.div>
                    ) : (
                        <Link
                        href={route('login')}
                        className="bg-[#e0b52b] px-4 py-2 text-white rounded-xl shadow hover:bg-yellow-500 transition z-[999]"
                        >
                        {t('Login')}
                        </Link>
                    )}

                    {/* List Your Property Button */}
                    <Link href="/post-property">
                        <div className="flex items-center gap-2 px-4 py-2 text-white bg-[#e0b52b] rounded-xl shadow hover:bg-yellow-500 transition">
                        <Plus size={20} />
                        <span className='hidden md:block'>{t('List your property')}</span>
                        </div>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <MobMenu Menus={Menus} />
                    </div>
                </div>
                
            </nav>
        </header>
    </>
  )
}

export default NavBar