import React from 'react';
import backgroundImage from '../../../assets/background.jpg';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';

import Dropdown from '@/Components/Dropdown';

const Hero = ({ auth }) => {
  const { t } = useTranslation();

  return (
    <div
      className="h-screen bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.9)',
      }}
    >
      <main className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-screen-xl px-4">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 10,
              duration: 0.8,
            }}
            className="text-center mb-2 md:mb-8"
          >
            <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-[#e0b52b] px-2 py-1 rounded">Real</span>{' '}
              Estate Platform
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 18,
              delay: 0.3,
            }}
            className="flex flex-wrap justify-center items-center bg-white/10 p-6 md:p-8 lg:p-10 rounded-xl backdrop-blur-sm border border-white/60"
          >
            {/* Category Dropdown */}
            <Dropdown>
              <Dropdown.Trigger>
                <button
                  type="button"
                  className="inline-flex items-center rounded-l-lg bg-white px-3 py-2 md:py-3 lg:py-4 border-r text-sm font-medium text-gray-700 hover:text-black focus:outline-none"
                >
                  <SlidersHorizontal size={16} className="text-gray-900" />
                  <span className="hidden md:inline ml-2 text-sm md:text-md lg:text-lg">
                    {t('Any')}
                  </span>
                </button>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <Dropdown.Link href="#">Residential</Dropdown.Link>
                <Dropdown.Link href="#">Commercial</Dropdown.Link>
                <Dropdown.Link href="#">Industrial</Dropdown.Link>
              </Dropdown.Content>
            </Dropdown>

            {/* Search Input */}
            <input
              type="text"
              id='search_myproperty'
              name='search_myproperty'
              placeholder={t('Search')}
              className="flex-1 min-w-[180px] sm:min-w-[300px] md:min-w-[500px] lg:min-w-[600px] xl:min-w-[700px] px-3 py-1.5 border-0  md:py-3 lg:py-4 text-black placeholder-gray-600 text-sm md:text-md lg:text-lg focus:outline-none"
            />

            {/* Search Button */}
            <button className="flex items-center bg-[#e0b52b] hover:bg-[#d1a32c] rounded-r-lg text-white text-sm md:text-md lg:text-lg px-4 py-2 md:py-3 lg:py-4 transition-colors duration-300">
              <Search size={16} className="mr-1" />
              <span className="hidden md:inline">{t('Search')}</span>
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Hero;
