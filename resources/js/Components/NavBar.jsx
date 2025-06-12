import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import i18n from '../../i18n';
import framer_logo from '../../assets/framer_logo.png';
import { Menus } from '../utils';
import DesktopMenu from '@/Components/DestopMenu';
import MobMenu from '@/Components/MobMenu';
import { CircleUser, Languages, Plus } from 'lucide-react';

const NavBar = () => {
  const auth = usePage().props.auth;
  const { t } = useTranslation();
  const [isHover, setIsHover] = useState(false);

  const languageAnimate = {
    enter: {
      opacity: 1,
      rotateX: 0,
      display: 'block',
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      rotateX: -15,
      display: 'none',
      transition: { duration: 0.3 },
    },
  };

  const handleChangeLanguage = (lang, langLabel) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to switch to ${langLabel}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, switch',
      cancelButtonText: 'No, cancel',
      customClass: {
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 mr-3 rounded',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        i18n.changeLanguage(lang);
        Swal.fire({
          icon: 'success',
          title: 'Switched!',
          text: `Language changed to ${langLabel}.`,
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'bg-white rounded-lg shadow-lg' },
        });
      }
    });
  };

  return (
    <header className="h-16 z-50 fixed top-0 left-0 right-0 bg-[#5c7934]">
      <nav className="flex justify-between items-center h-full max-w-8xl mx-auto px-4 text-sm">
        <Link href="/">
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="flex items-center gap-3">
            <img src={framer_logo} alt="logo" className="w-8 h-8" />
            <h3 className="hidden md:block text-white text-lg font-semibold">MJVI Realty</h3>
          </motion.div>
        </Link>

        {/* Desktop Menu */}
        <motion.ul
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="hidden lg:flex gap-4"
        >
          {Menus.map((menu) => (
            <DesktopMenu menu={menu} key={menu.name} />
          ))}
        </motion.ul>

        <div className="flex items-center gap-3">
          {auth?.user ? (
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="relative hidden lg:block"
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              <button className="border border-secondary flex items-center gap-2 px-4 py-2 text-secondary hover:text-white rounded-md hover:bg-secondary transition">
                <CircleUser size={20} />
                <span className="font-medium text-sm">{auth.user.name}</span>
              </button>

              <motion.div
                className="absolute top-full right-0 mt-2 w-52 bg-white border rounded-md shadow-md p-2 z-50"
                initial="exit"
                animate={isHover ? 'enter' : 'exit'}
                variants={languageAnimate}
              >
                <Link href="/dashboard" className="block p-2 text-gray-700 hover:bg-accent hover:text-white rounded-md">
                  Dashboard
                </Link>
                <div className="px-2 pt-2 pb-1 text-xs text-gray-500 font-semibold">Language</div>
                <button onClick={() => handleChangeLanguage('fil', 'Filipino')} className="flex items-center w-full px-4 py-2 hover:bg-accent rounded-md hover:text-white">
                  <img src="https://flagcdn.com/ph.svg" alt="Filipino Flag" className="w-5 h-5 mr-2" /> Filipino
                </button>
                <button onClick={() => handleChangeLanguage('en', 'English')} className="flex items-center w-full px-4 py-2 hover:bg-accent rounded-md hover:text-white">
                  <img src="https://flagcdn.com/us.svg" alt="English Flag" className="w-5 h-5 mr-2" /> English
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div initial={{ y: -50 }} animate={{ y: 0 }}>
              <Link href={route('login')} className="border border-secondary px-4 py-2 text-sm text-secondary hover:bg-secondary hover:text-white rounded-md">
                {t('Login')}
              </Link>
            </motion.div>
          )}

          <motion.div initial={{ y: -50 }} animate={{ y: 0 }}>
            <Link href="/post-property">
              <div className="flex items-center gap-2 px-4 py-2 text-white bg-secondary hover:bg-[#CFA31F] rounded-md">
                <Plus size={20} />
                <span className="hidden md:block">{t('List your property')}</span>
              </div>
            </Link>
          </motion.div>

          <div className="lg:hidden">
            <MobMenu Menus={Menus} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
