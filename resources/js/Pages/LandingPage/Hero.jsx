import React, { useState } from 'react'
import framer_logo from '../../../assets/framer_logo.png'
import backgroundImage from '../../../assets/background.jpg';
import  { Menus } from '../../utils';
import DesktopMenu from '@/Components/DestopMenu';
import MobMenu from '@/Components/MobMenu';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import i18n from '../../../i18n';
import { 
    Languages, 
    Search, 
    SlidersHorizontal 
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';


const Hero = () => {
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
    
    <div className='h-screen bg-no-repeat ' style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', brigtness: '0.5' }}>
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
                    <Link href={route('login')} className='bg-[#e0b52b] z-[999] relative px-3 py-1.5 text-white shadow rounded-xl flex-center'>{t('Login')}</Link>
                    <div className='lg:hidden'>
                        <MobMenu Menus={Menus}/>
                    </div>
                </div>
                
                
            </nav>
        </header>
        <main className="flex justify-center items-center min-h-screen bg-cover bg-center">
            <div className="w-full max-w-screen-xl px-4">
                <div className="text-center mb-2 md:mb-8">
                    <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                        <span className="bg-[#e0b52b] px-2 py-1 rounded">Real</span>{' '}
                        Estate Platform
                    </h1>
                </div>

                <div className="flex border flex-wrap justify-center items-center gap-2 sm:gap-4 bg-white/20 backdrop-blur-none p-4 sm:p-6 lg:p-10 rounded-xl">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder={t('search')}
                        className="flex-1 min-w-[180px] sm:min-w-[300px] md:min-w-[500px] lg:min-w-[600px] xl:min-w-[700px] px-3 py-2 rounded-lg text-black border-0 placeholder-gray-600"
                    />

                    {/* Property Type Dropdown */}
                    <Dropdown>
                        <Dropdown.Trigger>
                        <span className="inline-flex rounded-md">
                            <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 hover:text-black focus:outline-none"
                            >
                            <SlidersHorizontal size={16} className="text-gray-900" />
                            <span className="hidden md:inline ml-2">
                                {t('Property Type')}
                            </span>
                            </button>
                        </span>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                        <Dropdown.Link href="#">Residential</Dropdown.Link>
                        <Dropdown.Link href="#">Commercial</Dropdown.Link>
                        <Dropdown.Link href="#">Industrial</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>

                    {/* Search Button */}
                    <button className="flex items-center bg-[#e0b52b] hover:bg-[#d1a32c] text-white px-4 py-2 rounded-lg transition-colors duration-300">
                        <Search size={16} className="mr-1" />
                        <span className="hidden md:inline">{t('Search')}</span>
                    </button>
                </div>
            </div>
        </main>

    </div>
  )
}

export default Hero