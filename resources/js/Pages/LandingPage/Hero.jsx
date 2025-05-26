import React, { useState } from 'react'
import backgroundImage from '../../../assets/background.jpg';

import { useTranslation } from 'react-i18next';

import { 
    Languages, 
    Search, 
    SlidersHorizontal 
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import NavBar from '@/Components/NavBar';


const Hero = () => {
    const { t } = useTranslation();
    
 
  return (
    
    <div className='h-screen bg-no-repeat ' style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', brigtness: '0.5' }}>
        <NavBar/>
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