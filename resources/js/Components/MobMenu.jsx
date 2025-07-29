import React, { useState } from 'react';
import { ChevronDown, Menu, X, User, Settings, Languages, LogOut, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import {Link, usePage} from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function MobMenu({ Menus , onLanguageChange, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const [clicked, setClicked] = useState(false);
    const { t } = useTranslation();

    const auth = usePage().props.auth;


    // toggle drawer
    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

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
    };

    return (
        <div className='z-[999]'>
            <button
                onClick={toggleDrawer}
                className='z-50 relative p-2 text-secondary hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none'
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? "0%" : "-100%"}}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className='fixed left-0 right-0 top-16 overflow-y-auto h-full bg-white shadow-xl'
            >
                <div className="p-6">
                    {/* List Property Button */}
                    {/* Dashboard or List Property Button */}
                    <div className="mb-6">
                        {auth?.user ? (
                            <Link
                                href={
                                    auth.user.role === 'Seller'
                                        ? '/seller/dashboard'
                                        : auth.user.role === 'Agent'
                                            ? '/agents/dashboard'
                                            : '/dashboard'
                                }
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex items-center gap-3 p-4 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-200">
                                    <Settings size={20} />
                                    <span className="font-semibold">{t('Dashboard')}</span>
                                </div>
                            </Link>
                        ) : (
                            <Link href="/post-property" onClick={() => setIsOpen(false)}>
                                <div className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/90 text-white rounded-xl transition-all duration-200">
                                    <Plus size={20} />
                                    <span className="font-semibold">{t('List your property')}</span>
                                </div>
                            </Link>
                        )}
                    </div>


                    {/* Navigation Menu */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Navigation</h3>
                        <ul className="space-y-2">
                            {Menus?.map(({name, subMenu}, i) => {
                                // checking if menu exist
                                const hasSubMenu = subMenu?.length > 0;
                                // checking if the menu is clicked
                                const isclicked = clicked === i;
                                return (
                                    <li key={name}>
                                        <div
                                            className='flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200 text-gray-700'
                                            onClick={() => setClicked(isclicked ? null : i)}
                                        >
                                            <span className="font-medium">{name}</span>
                                            {hasSubMenu && (
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-200 ${isclicked ? 'rotate-180' : ''}`}
                                                />
                                            )}
                                        </div>
                                        { hasSubMenu && (
                                            <motion.ul
                                                className='ml-4 mt-2 space-y-1'
                                                initial= "exit"
                                                animate= { isclicked ? "enter" : "exit"}
                                                variants={subMenuDrawer}
                                            >
                                                {subMenu?.map(({name, icon : Icon}) => (
                                                    <li key={name} className='p-2 flex items-center hover:bg-gray-50 rounded-lg cursor-pointer gap-x-3 text-gray-600 hover:text-gray-800 transition-colors duration-200'>
                                                        <Icon size={16}/>
                                                        <span className="text-sm">{name}</span>
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Language Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Languages size={14} />
                            Language
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    onLanguageChange('fil', 'Filipino');
                                    setIsOpen(false);
                                }}
                                className="flex items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-700"
                            >
                                <img src="https://flagcdn.com/ph.svg" alt="Filipino Flag" className="w-5 h-5 mr-3" />
                                <span>Filipino</span>
                            </button>
                            <button
                                onClick={() => {
                                    onLanguageChange('en', 'English');
                                    setIsOpen(false);
                                }}
                                className="flex items-center w-full p-3 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-700"
                            >
                                <img src="https://flagcdn.com/us.svg" alt="English Flag" className="w-5 h-5 mr-3" />
                                <span>English</span>
                            </button>
                        </div>
                    </div>

                    {/* Login/Logout Section */}
                    {auth?.user ? (
                        <div className="pt-4 border-t border-gray-200">
                            <Link
                                href='/dashboard'
                                className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                                <LogOut size={18} />
                                <span className="font-medium">Dashboard</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="pt-4 border-t border-gray-200">
                            <Link
                                href={route('login')}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 w-full p-3 hover:bg-primary/90 text-white rounded-lg transition-colors duration-200 justify-center font-medium"
                            >
                                <User size={18} />
                                <span>{t('Login')}</span>
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
