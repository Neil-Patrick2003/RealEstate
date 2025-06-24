import React from 'react';
import backgroundImage from '../../../assets/background.jpg';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

import Dropdown from '@/Components/Dropdown';

const Hero = ({ auth }) => {
    const { t } = useTranslation();

    return (
        <div
            className="relative h-screen bg-no-repeat overflow-hidden"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/10"></div>
            
            <main className="relative z-10 flex justify-center items-center min-h-screen">
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Main Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                        }}
                        className="text-center mb-8 lg:mb-12"
                    >
                        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4">
                            Find Your Perfect Home
                        </h1>
                        <p className="text-gray-200 text-lg sm:text-xl lg:text-2xl font-light max-w-3xl mx-auto">
                            Discover exceptional properties and make your dream home a reality with our premium real estate platform
                        </p>
                    </motion.div>

                    {/* Enhanced Search Bar */}
                    <motion.div
                        initial={{ opacity: 0.5, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.1
                       
                        }}
                        className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-white/20 max-w-5xl mx-auto"
                    >
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">
                            {/* Property Type Dropdown */}
                            <div className="flex-shrink-0">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="w-full lg:w-auto inline-flex items-center justify-center lg:justify-start rounded-xl lg:rounded-l-xl lg:rounded-r-none bg-gray-50 hover:bg-gray-100 px-4 py-3 lg:py-4 border-0 lg:border-r border-gray-200 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200"
                                        >
                                            <SlidersHorizontal size={18} className="text-primary mr-2" />
                                            <span className="text-sm lg:text-base">
                                                Property Type
                                            </span>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href="#" className="flex items-center">
                                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                            Residential
                                        </Dropdown.Link>
                                        <Dropdown.Link href="#" className="flex items-center">
                                            <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                                            Commercial
                                        </Dropdown.Link>
                                        <Dropdown.Link href="#" className="flex items-center">
                                            <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                                            Industrial
                                        </Dropdown.Link>
                                        <Dropdown.Link href="#" className="flex items-center">
                                            <span className="w-2 h-2 bg-primary/70 rounded-full mr-2"></span>
                                            Land
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Search Input with Location Icon */}
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id='search_my_property'
                                    placeholder="Enter location, property type, or keywords..."
                                    className="w-full pl-12 pr-4 py-3 lg:py-4 border-0 text-gray-700 placeholder-gray-500 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl lg:rounded-none bg-gray-50 hover:bg-white focus:bg-white transition-colors duration-200"
                                />
                            </div>

                            {/* Enhanced Search Button */}
                            <div className="flex-shrink-0">
                                <button className="w-full lg:w-auto flex items-center justify-center bg-primary hover:bg-primary/90 rounded-xl lg:rounded-r-xl lg:rounded-l-none text-white text-sm lg:text-base font-semibold px-6 py-3 lg:py-4 transition-colors duration-300 focus:outline-none shadow-lg hover:shadow-xl">
                                    <Search size={18} className="mr-2" />
                                    <span>Search Properties</span>
                                </button>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                <span className="text-sm text-gray-600 font-medium mr-2">Popular:</span>
                                {['Apartments', 'Houses', 'Condos', 'Townhomes'].map((filter) => (
                                    <button
                                        key={filter}
                                        className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full border border-primary/30 hover:border-primary/50 transition-colors duration-200 focus:outline-none"
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default Hero;
