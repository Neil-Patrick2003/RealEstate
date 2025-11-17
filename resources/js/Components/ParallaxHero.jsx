import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, MapPin, Home, Pencil, Copy, ArchiveX, Trash2, ChevronDown } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useParallax } from "../../hooks/useParallax.js";

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
                // style={{
                //     y: y1,
                //     backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920')",
                //     backgroundSize: 'cover',
                //     backgroundPosition: 'center',
                // }}
            />
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    y: y2,
                    x: mousePosition.x * 20,
                    backgroundImage: "url('https://as2.ftcdn.net/jpg/05/38/94/65/1000_F_538946570_HNfmPaLd8LZxN6kB6tx5M3dzyL3MIsgZ.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Floating 3D Elements */}
            <motion.div
                className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl"
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
                className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full opacity-20 blur-3xl"
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
                className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center"
                style={{ opacity, scale }}
            >
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6"
                >
                    Find Your Perfect
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        Property
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-lg sm:text-xl text-neutral-300 mb-8 sm:mb-12 max-w-2xl px-2"
                >
                    Explore verified listings with clear map boundaries — making property search simple, visual, and transparent.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="w-full max-w-3xl"
                >
                    {/* Mobile Layout - Vertical */}
                    <div className="lg:hidden space-y-3">
                        {/* Location Input - Mobile */}
                        <div className="relative bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MapPin className="w-5 h-5 text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter location..."
                                className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-neutral-400 outline-none text-base"
                            />
                        </div>

                        {/* Property Type & Search Button Row - Mobile */}
                        <div className="flex gap-2">
                            {/* Property Type Menu - Mobile */}
                            <div className="flex-1">
                                <Menu>
                                    <MenuButton className="w-full inline-flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 px-4 py-4 text-white hover:bg-white/20 transition-colors duration-150">
                                        <span className="flex items-center gap-2">
                                            <Home className="w-5 h-5 text-neutral-400" />
                                            <span className="text-sm font-medium">Type</span>
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                    </MenuButton>

                                    <MenuItems
                                        transition
                                        anchor="bottom start"
                                        className="w-full origin-top-right z-50 rounded-xl border border-white/5 bg-neutral-800/95 backdrop-blur-lg p-2 text-sm text-white transition duration-100 ease-out [--anchor-gap:8px] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                                    >
                                        <MenuItem>
                                            <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                                <Home className="w-4 h-4" />
                                                Apartment
                                            </button>
                                        </MenuItem>
                                        <MenuItem>
                                            <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                                <Home className="w-4 h-4" />
                                                Commercial
                                            </button>
                                        </MenuItem>
                                        <MenuItem>
                                            <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                                <Home className="w-4 h-4" />
                                                Condominium
                                            </button>
                                        </MenuItem>
                                        <MenuItem>
                                            <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                                <Home className="w-4 h-4" />
                                                House
                                            </button>
                                        </MenuItem>
                                        <MenuItem>
                                            <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                                <Home className="w-4 h-4" />
                                                Land
                                            </button>
                                        </MenuItem>
                                    </MenuItems>
                                </Menu>
                            </div>

                            {/* Search Button - Mobile */}
                            <button className="flex-shrink-0 inline-flex items-center justify-center bg-gradient-to-r from-primary to-accent rounded-xl text-white font-semibold px-6 py-4 hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[60px]">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden lg:flex w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-xl">
                        {/* Property Type Menu - Desktop */}
                        <div className="flex items-center justify-center flex-initial bg-white/5 border-r border-white/10 min-w-[140px]">
                            <Menu>
                                <MenuButton className="inline-flex items-center justify-center gap-2 w-full h-full text-sm font-semibold text-white px-6 py-4 hover:bg-white/10 transition-colors duration-150">
                                    <Home className="w-5 h-5 text-neutral-400" />
                                    <span>Type</span>
                                    <ChevronDown className="w-4 h-4 fill-white/60" />
                                </MenuButton>

                                <MenuItems
                                    transition
                                    anchor="bottom start"
                                    className="w-52 origin-top-right z-50 rounded-xl border border-white/5 bg-neutral-800/95 backdrop-blur-lg p-2 text-sm text-white transition duration-100 ease-out [--anchor-gap:8px] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
                                >
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                            <Home className="w-4 h-4" />
                                            Apartment
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                            <Home className="w-4 h-4" />
                                            Commercial
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                            <Home className="w-4 h-4" />
                                            Condominium
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                            <Home className="w-4 h-4" />
                                            House
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 data-focus:bg-white/10">
                                            <Home className="w-4 h-4" />
                                            Land
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        </div>

                        {/* Location Input - Desktop */}
                        <div className="flex items-center flex-grow bg-white/5 px-6 py-4">
                            <div className="flex items-center w-full">
                                <MapPin className="w-5 h-5 text-neutral-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Enter location..."
                                    className="bg-transparent flex-1 text-white placeholder-neutral-400 outline-none text-base"
                                />
                            </div>
                        </div>

                        {/* Search Button - Desktop */}
                        <button className="flex-shrink-0 inline-flex items-center justify-center bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-4 hover:shadow-xl hover:scale-105 transition-all duration-300 min-w-[180px] gap-2">
                            <Search className="w-5 h-5" />
                            <span>Search</span>
                        </button>
                    </div>
                </motion.div>


                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="absolute bottom-6 sm:bottom-10"
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
