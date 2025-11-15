import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, MapPin, Home, Pencil, Copy, ArchiveX, Trash2, ChevronDown } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
    ArchiveBoxXMarkIcon,
    ChevronDownIcon,
    PencilIcon,
    Square2StackIcon,
    TrashIcon,
} from '@heroicons/react/16/solid'
import {useParallax} from "../../hooks/useParallax.js";

function ParallaxHero() {
    const { scrollY } = useScroll();
    const { mousePosition } = useParallax();

    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

    return (
        <div className="relative h-screen overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
            {/* Animated Background Layers */}
            <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                    y: y1,
                    backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    y: y2,
                    x: mousePosition.x * 20,
                    backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Floating 3D Elements with New Colors */}
            <motion.div
                className="absolute top-20 left-10 w-64 h-64 bg-primary-500 rounded-full opacity-20 blur-3xl"
                animate={{
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    x: mousePosition.x * 30,
                    y: mousePosition.y * 30,
                }}
            />

            <motion.div
                className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500 rounded-full opacity-20 blur-3xl"
                animate={{
                    y: [0, -50, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    x: mousePosition.x * -40,
                    y: mousePosition.y * -40,
                }}
            />

            {/* Content */}
            <motion.div
                className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center"
                style={{ opacity, scale }}
            >
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-7xl font-bold text-white mb-6"
                >
                    Find Your Perfect
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">
                        Property
          </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-xl text-neutral-300 mb-12 max-w-2xl"
                >
                    Explore verified listings with clear map boundaries — making property search simple, visual, and transparent.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="w-full max-w-3xl"
                >
                    {/* KEY FIX: Removed p-8 padding and ensured single-line flex layout */}
                    <div className="flex w-full bg-white/10 backdrop-blur-lg rounded-2xl border p-12 border-white/20 overflow-hidden shadow-xl">

                        {/* 1. Property Type Menu (Icon + Text on Desktop) */}
                        <div className="flex items-center justify-center flex-initial bg-white/5 py-3 border-r rounded-l-xl border-white/10">
                            <Menu>
                                {/* Button content optimized for mobile: just Home icon */}
                                <MenuButton className="inline-flex items-center justify-center gap-1.5 w-full h-full text-sm/6 font-semibold text-white px-2 sm:px-4 hover:bg-white/10 transition-colors duration-150">
                                    <Home className="w-5 h-5 text-neutral-400" />
                                    {/* Text is hidden on mobile */}
                                    <span className="hidden sm:inline">Type</span>
                                    <ChevronDown className="hidden sm:inline size-4 fill-white/60" />
                                </MenuButton>

                                <MenuItems
                                    transition
                                    anchor="bottom start"
                                    className="w-52 origin-top-right z-50 rounded-xl border border-white/5 bg-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                                >
                                    {/* Menu Items Content - Using Lucide icons */}
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                                            <Pencil className="size-4 fill-white/30" />
                                            Apartment
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                                            <Copy className="size-4 fill-white/30" />
                                            Commercial
                                        </button>
                                    </MenuItem>
                                    <div className="my-1 h-px bg-white/5" />
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                                            <ArchiveX className="size-4 fill-white/30" />
                                            Condominium
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                                            <Trash2 className="size-4 fill-white/30" />
                                            House
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                                            <MapPin className="size-4 fill-white/30" />
                                            Land
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        </div>


                        {/* 2. Location Input (Maximized Space) */}
                        <div className="flex items-center flex-grow bg-white/5 px-4 py-3">
                            {/* MapPin icon removed for space */}
                            <input
                                type="text"
                                placeholder="Enter location..."
                                className="bg-transparent flex-1 text-white placeholder-neutral-400 outline-none"
                            />
                        </div>

                        {/* 3. Search Button (Icon + Text on Desktop) */}
                        <button className={`bg-gradient-to-r from-primary to-primary-500 border-r-lg text-white px-4 rounded-r-lg sm:px-8 py-3 font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}>
                            <Search className="w-5 h-5" />
                            {/* Text is hidden on mobile */}
                                    <span className="hidden sm:block">Search</span>
                        </button>
                    </div>
                </motion.div>


                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="absolute bottom-10"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
                    >
                        <motion.div className="w-1 h-2 bg-white rounded-full" />
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default ParallaxHero;
