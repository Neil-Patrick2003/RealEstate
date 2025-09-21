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
import { CircleUser , Languages, Plus, Home } from 'lucide-react';

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
        confirmButton: 'bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 mr-3 rounded',
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
    <header className="h-16 fixed top-0 left-0 right-0 bg-white shadow  z-[1100] ">
      <nav className="flex justify-between items-center h-full max-w-7xl mx-auto text-sm">
        <Link href="/">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 hover:scale-105 transition-transform duration-200"
          >
            <img src={framer_logo} alt="logo" className="w-8 h-8 -ml-1.5 drop-shadow-md" />
            <h3 className="hidden md:block text-primary text-lg font-bold tracking-wide drop-shadow-sm">
              MJVI Realty
            </h3>
          </motion.div>
        </Link>

        {/* Desktop Menu */}
        <motion.ul
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:flex gap-6"
        >
          {Menus.map((menu, index) => (
            <motion.li
              key={menu.name}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <DesktopMenu menu={menu} />
            </motion.li>
          ))}
        </motion.ul>

        <div className="flex items-center gap-3">
          {auth?.user ? (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              <button className="border-2 border-primary/30 bg-white/10 backdrop-blur-sm flex items-center gap-2 px-4 py-2 text-primary hover:text-primary/90 rounded-lg hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 shadow-md">
                <CircleUser  size={20} className="text-primary/80" />
                <span className="font-medium text-sm">{auth.user.name}</span>
              </button>

              <motion.div
                className="absolute top-full right-0 mt-2 w-56 bg-white border-2 border-primary/20 rounded-xl shadow-xl p-3 z-50"
                initial="exit"
                animate={isHover ? 'enter' : 'exit'}
                variants={languageAnimate}
              >
                  {auth.user.role === 'Seller' && (
                      <Link
                          href="/seller/dashboard"
                          className="flex items-center gap-2 p-3 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 font-medium"
                      >
                          <Home size={16} />
                          Dashboard
                      </Link>
                  )}
                  {auth.user.role === 'Agent' && (
                      <Link
                          href="/agents/dashboard"
                          className="flex items-center gap-2 p-3 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 font-medium"
                      >
                          <Home size={16} />
                          Dashboard
                      </Link>
                  )}
                  {auth.user.role === 'Admin' && (
                      <Link
                          href="/Admin/dashboard"
                          className="flex items-center gap-2 p-3 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 font-medium"
                      >
                          <Home size={16} />
                          Dashboard
                      </Link>
                  )}
                  {auth.user.role === 'Buyer' && (
                      <Link
                          href="/dashboard"
                          className="flex items-center gap-2 p-3 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 font-medium"
                      >
                          <Home size={16} />
                          Dashboard
                      </Link>
                  )}

                <div className="border-t border-gray-100 my-2"></div>

                <div className="px-3 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                  <Languages size={12} />
                  Language
                </div>

                <button
                  onClick={() => handleChangeLanguage('fil', 'Filipino')}
                  className="flex items-center w-full px-3 py-2 hover:bg-primary/10 rounded-lg hover:text-primary transition-all duration-200"
                >
                  <img src="https://flagcdn.com/ph.svg" alt="Filipino Flag" className="w-5 h-5 mr-3 rounded-sm shadow-sm" />
                  Filipino
                </button>

                <button
                  onClick={() => handleChangeLanguage('en', 'English')}
                  className="flex items-center w-full px-3 py-2 hover:bg-primary/10 rounded-lg hover:text-primary transition-all duration-200"
                >
                  <img src="https://flagcdn.com/us.svg" alt="English Flag" className="w-5 h-5 mr-3 rounded-sm shadow-sm" />
                  English
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                href={route('login')}
                className="border-2 border-primary/30 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                {t('Login')}
              </Link>
            </motion.div>
          )}

          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/post-property">
              <div className="flex items-center gap-2 px-4 py-2 text-white bg-secondary hover:bg-secondary/90 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium">
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
