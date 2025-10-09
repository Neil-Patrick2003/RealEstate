import React from "react";
import { SlidersHorizontal, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Dropdown from "@/Components/Dropdown";

/**
 * Hero (polished with Framer Motion)
 * - Respects prefers-reduced-motion
 * - Smooth staged entrance for heading, sub, and search card
 * - Slight hover/tap feedback on controls
 * - Optional onSearch callback (non-breaking)
 */

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
};

const rise = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const cardIn = {
    hidden: { opacity: 0, y: 32, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, delay: 0.05 } },
};

const Hero = ({
                  searchTerm,
                  handleSearchTermChange,
                  selectedType,
                  handleTypeChange,
                  onSearch, // optional; call if provided
              }) => {
    const prefersReducedMotion = useReducedMotion();

    const propertyTypes = [
        { key: "All", label: "All", color: "bg-primary" },
        { key: "Residential", label: "Residential", color: "bg-primary" },
        { key: "Commercial", label: "Commercial", color: "bg-secondary" },
        { key: "Industrial", label: "Industrial", color: "bg-accent" },
        { key: "Land", label: "Land", color: "bg-primary/70" },
    ];

    const selected = propertyTypes.find((pt) => pt.key === selectedType) || propertyTypes[0];

    const handleSubmit = (e) => {
        e?.preventDefault?.();
        if (typeof onSearch === "function") onSearch();
    };

    return (
        <>
            <div className="absolute inset-0 bg-black/10" aria-hidden />

            <main className="relative z-10 flex justify-center items-center h-[100vh]">
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Heading */}
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={container}
                        className="text-center mb-8 lg:mb-12"
                    >
                        <motion.h1
                            variants={rise}
                            className="text-white text-2xl md:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4"
                        >
                            Find Your Perfect Property
                        </motion.h1>
                        <motion.p
                            variants={rise}
                            className="text-gray-200 text-md md:text-lg lg:text-xl xl:text-2xl font-light max-w-3xl mx-auto"
                        >
                            Explore verified listings with clear map boundaries — making property search simple, visual, and transparent.
                        </motion.p>
                    </motion.div>

                    {/* Search Card */}
                    <motion.form
                        initial={prefersReducedMotion ? undefined : "hidden"}
                        animate={prefersReducedMotion ? undefined : "show"}
                        variants={cardIn}
                        onSubmit={handleSubmit}
                        className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-white/20 max-w-5xl mx-auto"
                        role="search"
                        aria-label="Property search"
                    >
                        <div className="flex flex-row-reverse lg:flex-row gap-4 lg:gap-0">
                            {/* Property Type Dropdown */}
                            <div className="flex-shrink-0">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="w-full lg:w-auto inline-flex items-center justify-center lg:justify-start rounded-xl lg:rounded-l-xl lg:rounded-r-none bg-gray-50 hover:bg-gray-100 px-4 py-3 lg:py-4 border-0 lg:border-r border-gray-200 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200"
                                            aria-haspopup="listbox"
                                            aria-label="Choose property type"
                                        >
                                            <SlidersHorizontal size={20} className="text-primary lg:hidden" />
                                            <span className="hidden lg:flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${selected.color}`} />
                        <span className="text-sm lg:text-base">{selected.label}</span>
                      </span>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        {propertyTypes.map(({ key, label, color }) => (
                                            <div key={key} className="hover:bg-gray-100 flex items-center px-4 py-2 w-full">
                                                <button
                                                    className={`flex items-center text-sm hover:bg-gray-100 w-full text-left ${
                                                        selectedType === key ? "font-semibold text-primary" : ""
                                                    }`}
                                                    onClick={() => handleTypeChange(key)}
                                                    role="option"
                                                    aria-selected={selectedType === key}
                                                >
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${color}`} />
                                                    {label}
                                                </button>
                                            </div>
                                        ))}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={handleSearchTermChange}
                                    id="search_my_property"
                                    placeholder="Enter location, property type, or keywords..."
                                    className="w-full pl-12 pr-4 py-3 lg:py-4 border-0 text-gray-700 placeholder-gray-500 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl lg:rounded-none bg-gray-50 hover:bg-white focus:bg-white transition-colors duration-200"
                                    aria-label="Search by location or keyword"
                                />
                            </div>

                            {/* Search Button */}
                            <div className="flex flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                                    type="submit"
                                    className="w-full lg:w-auto flex items-center justify-center bg-primary hover:bg-primary/90 rounded-xl lg:rounded-r-xl lg:rounded-l-none text-white text-sm lg:text-base font-semibold px-6 py-3 lg:py-4 transition-colors duration-300 focus:outline-none shadow-lg hover:shadow-xl"
                                >
                                    <Search size={18} className="mr-2" />
                                    <span>Search Properties</span>
                                </motion.button>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                <span className="text-sm text-gray-600 font-medium mr-2">Popular:</span>
                                {["Apartments", "Houses", "Condos", "Townhomes"].map((filter) => (
                                    <motion.button
                                        key={filter}
                                        type="button"
                                        whileHover={{ y: prefersReducedMotion ? 0 : -1 }}
                                        className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full border border-primary/30 hover:border-primary/50 transition-colors duration-200 focus:outline-none"
                                    >
                                        {filter}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.form>
                </div>

                <div className="absolute bottom-12 text-white text-2xl cursor-pointer select-none">
                    <motion.span
                        initial={{ y: 0 }}
                        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
                        transition={{ repeat: prefersReducedMotion ? 0 : Infinity, duration: 1.6 }}
                    >
                        Scroll down
                    </motion.span>
                </div>
            </main>
        </>
    );
};

export default Hero;
