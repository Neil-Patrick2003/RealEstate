import React from "react";
import { SlidersHorizontal, Search, MapPin, ChevronDown } from "lucide-react";
import Dropdown from "@/Components/Dropdown";

const Hero = ({
                  searchTerm,
                  handleSearchTermChange,
                  selectedType,
                  handleTypeChange,
                  onSearch, // optional; call if provided
              }) => {
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
            <main className="min-h-[80vh] sm:h-80 flex justify-center items-center pt-20 sm:pt-0 pb-8 sm:pb-0">
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Heading */}
                    <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-3 sm:mb-4">
                            Find Your Perfect Property
                        </h1>
                        <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl font-light max-w-3xl mx-auto px-2">
                            Explore verified listings with clear map boundaries — making property
                            search simple, visual, and transparent.
                        </p>
                    </div>

                    {/* Search Card */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white/95 backdrop-blur-lg p-3 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-white/20 max-w-5xl mx-auto"
                        role="search"
                        aria-label="Property search"
                    >
                        {/* Mobile Layout - Vertical Stack */}
                        <div className="lg:hidden space-y-2.5">
                            {/* Search Input - Mobile */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={handleSearchTermChange}
                                    id="search_my_property"
                                    placeholder="Enter location, property type, or keywords..."
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 text-xs sm:text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-white focus:bg-white transition-colors duration-200"
                                    aria-label="Search by location or keyword"
                                />
                            </div>

                            {/* Property Type & Search Button Row - Mobile */}
                            <div className="flex gap-1.5">
                                {/* Property Type Dropdown - Mobile */}
                                <div className="flex-1">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="w-full inline-flex items-center justify-between rounded-lg bg-gray-50 hover:bg-gray-100 px-3 py-2.5 border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200"
                                                aria-haspopup="listbox"
                                                aria-label="Choose property type"
                                            >
                                                <span className="flex items-center">
                                                    <SlidersHorizontal size={16} className="text-primary mr-1.5" />
                                                    <span className="truncate">{selected.label}</span>
                                                </span>
                                                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="left" width="w-full">
                                            {propertyTypes.map(({ key, label, color }) => (
                                                <div
                                                    key={key}
                                                    className="hover:bg-gray-100 flex items-center px-4 py-2.5 w-full"
                                                >
                                                    <button
                                                        className={`flex items-center text-xs sm:text-sm hover:bg-gray-100 w-full text-left ${
                                                            selectedType === key
                                                                ? "font-semibold text-primary"
                                                                : ""
                                                        }`}
                                                        onClick={() => handleTypeChange(key)}
                                                        role="option"
                                                        aria-selected={selectedType === key}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full mr-3 ${color}`} />
                                                        {label}
                                                    </button>
                                                </div>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                {/* Search Button - Mobile */}
                                <button
                                    type="submit"
                                    className="flex-shrink-0 inline-flex items-center justify-center bg-primary hover:bg-primary/90 rounded-lg text-white text-xs sm:text-sm font-semibold px-3 py-2.5 transition-colors duration-300 focus:outline-none shadow-lg hover:shadow-xl min-w-[80px] sm:min-w-[100px]"
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Desktop Layout - Horizontal */}
                        <div className="hidden lg:flex flex-row gap-0">
                            {/* Property Type Dropdown - Desktop */}
                            <div className="flex-shrink-0">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-start rounded-l-xl bg-gray-50 hover:bg-gray-100 px-6 py-4 border-r border-gray-200 text-base font-medium text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200 min-w-[160px]"
                                            aria-haspopup="listbox"
                                            aria-label="Choose property type"
                                        >
                                            <span className="flex items-center">
                                                <span className={`w-2 h-2 rounded-full mr-3 ${selected.color}`} />
                                                <span className="text-base">
                                                    {selected.label}
                                                </span>
                                            </span>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        {propertyTypes.map(({ key, label, color }) => (
                                            <div
                                                key={key}
                                                className="hover:bg-gray-100 flex items-center px-4 py-3 w-full"
                                            >
                                                <button
                                                    className={`flex items-center text-sm hover:bg-gray-100 w-full text-left ${
                                                        selectedType === key
                                                            ? "font-semibold text-primary"
                                                            : ""
                                                    }`}
                                                    onClick={() => handleTypeChange(key)}
                                                    role="option"
                                                    aria-selected={selectedType === key}
                                                >
                                                    <span className={`w-2 h-2 rounded-full mr-3 ${color}`} />
                                                    {label}
                                                </button>
                                            </div>
                                        ))}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Search Input - Desktop */}
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={handleSearchTermChange}
                                    id="search_my_property"
                                    placeholder="Enter location, property type, or keywords..."
                                    className="w-full pl-12 pr-4 py-4 border-0 text-gray-700 placeholder-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-gray-50 hover:bg-white focus:bg-white transition-colors duration-200"
                                    aria-label="Search by location or keyword"
                                />
                            </div>

                            {/* Search Button - Desktop */}
                            <button
                                type="submit"
                                className="flex-shrink-0 inline-flex items-center justify-center bg-primary hover:bg-primary/90 rounded-r-xl text-white text-base font-semibold px-8 py-4 transition-colors duration-300 focus:outline-none shadow-lg hover:shadow-xl min-w-[180px]"
                            >
                                <Search size={20} className="mr-2" />
                                <span>Search Properties</span>
                            </button>
                        </div>

                        {/* Quick Filters */}
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center lg:justify-start">
                                <span className="text-[11px] sm:text-xs md:text-sm text-gray-600 font-medium mr-1.5 sm:mr-2">
                                    Popular:
                                </span>
                                {["Apartments", "Houses", "Condos", "Townhomes"].map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        className="px-2 sm:px-3 py-[3px] sm:py-1 text-[11px] sm:text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full border border-primary/30 hover:border-primary/50 transition-colors duration-200 focus:outline-none"
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-6 sm:bottom-12 text-white text-sm sm:text-base cursor-pointer select-none animate-bounce">
                    <span className="hidden sm:block">Scroll down</span>
                    <span className="sm:hidden">↓ Scroll ↓</span>
                </div>
            </main>
        </>
    );
};

export default Hero;
