import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHeart,
    faSearch,
    faHome,
    faMapMarkerAlt,
    faFilter,
    faSort,
    faTimes,
    faRocket,
    faEnvelope,
    faFolderOpen,
    faBars,
    faXmark
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as RegularHeart } from "@fortawesome/free-regular-svg-icons";
import { Head, Link, router } from "@inertiajs/react";
import React, { useState, useMemo } from "react";
import PropertyCard from "@/Components/Property/PropertyCard.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import PageHeader from "@/Components/ui/PageHeader.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function Favourites({ properties, favouriteIds = [] }) {
    const [favorites, setFavorites] = useState(new Set(favouriteIds));
    const [loading, setLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [filterType, setFilterType] = useState("all");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Filter and sort properties
    const filteredProperties = useMemo(() => {
        let filtered = properties.filter(property => {
            const matchesSearch = property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                property.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                property.property_type?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterType === "all" ||
                property.property_type?.toLowerCase() === filterType.toLowerCase();

            return matchesSearch && matchesFilter;
        });

        // Sort properties
        switch (sortBy) {
            case "price-low":
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case "price-high":
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case "newest":
                filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
                break;
            default:
                break;
        }

        return filtered;
    }, [properties, searchTerm, sortBy, filterType]);

    // Get unique property types for filter
    const propertyTypes = useMemo(() => {
        const types = [...new Set(properties.map(p => p.property_type).filter(Boolean))];
        return types;
    }, [properties]);

    const toggleFavorite = (propertyId) => {
        if (loading === propertyId) return;

        setLoading(propertyId);

        router.post(
            route('favourites.toggle'),
            { property_id: propertyId },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setFavorites(prev => {
                        const updated = new Set(prev);
                        if (updated.has(propertyId)) {
                            updated.delete(propertyId);
                            // Remove the property from the list if it's unfavorited
                            const updatedProperties = properties.filter(p => p.id !== propertyId);
                            // Note: You might want to use Inertia.reload() here instead
                        } else {
                            updated.add(propertyId);
                        }
                        return updated;
                    });
                    setLoading(null);
                },
                onError: () => {
                    setLoading(null);
                },
            }
        );
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setSortBy("newest");
        setFilterType("all");
        setMobileFiltersOpen(false);
    };

    const clearSearch = () => setSearchTerm("");
    const clearFilter = () => setFilterType("all");
    const clearSort = () => setSortBy("newest");

    const hasActiveFilters = searchTerm || filterType !== "all" || sortBy !== "newest";

    return (
        <AuthenticatedLayout>
            <Head title="My Favorites" />

            <div className="page-container">
                <div className="page-content">
                    {/* Header Section */}
                    <div className="page-header pb-4 md:pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-2">
                                <h1 className="section-title text-2xl sm:text-3xl font-bold">My Favorites</h1>
                                <p className="section-description text-gray-600 text-sm sm:text-base max-w-2xl">
                                    View and manage your favorite properties here.
                                </p>
                            </div>
                            <Link
                                href="/properties"
                                className="btn-primary w-full sm:w-auto justify-center"
                            >
                                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                                Browse Properties
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="btn-outline w-full justify-center"
                        >
                            <FontAwesomeIcon icon={faFilter} className="mr-2" />
                            Filters & Search
                            {hasActiveFilters && (
                                <span className="ml-2 bg-primary-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                    {[searchTerm, filterType !== "all", sortBy !== "newest"].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Filters Modal */}
                    <AnimatePresence>
                        {mobileFiltersOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                                    onClick={() => setMobileFiltersOpen(false)}
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: "spring", damping: 30 }}
                                    className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 lg:hidden shadow-2xl"
                                >
                                    <div className="flex flex-col h-full">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                                            <button
                                                onClick={() => setMobileFiltersOpen(false)}
                                                className="p-2 hover:bg-gray-100 rounded-lg"
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Filters Content */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {/* Search Input */}
                                            <div>
                                                <label className="form-label">Search Properties</label>
                                                <div className="relative">
                                                    <FontAwesomeIcon
                                                        icon={faSearch}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Search properties..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="form-input pl-10 pr-8"
                                                    />
                                                    {searchTerm && (
                                                        <button
                                                            onClick={clearSearch}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Property Type Filter */}
                                            <div>
                                                <label className="form-label">Property Type</label>
                                                <select
                                                    value={filterType}
                                                    onChange={(e) => setFilterType(e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="all">All Types</option>
                                                    {propertyTypes.map(type => (
                                                        <option key={type} value={type}>
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Sort By */}
                                            <div>
                                                <label className="form-label">Sort By</label>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="newest">Newest First</option>
                                                    <option value="oldest">Oldest First</option>
                                                    <option value="price-low">Price: Low to High</option>
                                                    <option value="price-high">Price: High to Low</option>
                                                </select>
                                            </div>

                                            {/* Active Filters */}
                                            {hasActiveFilters && (
                                                <div className="pt-4 border-t border-gray-200">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Active filters:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {searchTerm && (
                                                            <div className="badge badge-primary text-xs">
                                                                Search: "{searchTerm}"
                                                                <button
                                                                    onClick={clearSearch}
                                                                    className="ml-1 hover:text-primary-800 transition-colors"
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} className="w-2 h-2" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {filterType !== "all" && (
                                                            <div className="badge badge-accent text-xs">
                                                                Type: {filterType}
                                                                <button
                                                                    onClick={clearFilter}
                                                                    className="ml-1 hover:text-emerald-800 transition-colors"
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} className="w-2 h-2" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {sortBy !== "newest" && (
                                                            <div className="badge badge-secondary text-xs">
                                                                Sorted: {sortBy.replace('-', ' ')}
                                                                <button
                                                                    onClick={clearSort}
                                                                    className="ml-1 hover:text-gray-800 transition-colors"
                                                                >
                                                                    <FontAwesomeIcon icon={faTimes} className="w-2 h-2" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-200 space-y-2">
                                            <button
                                                onClick={() => setMobileFiltersOpen(false)}
                                                className="btn-primary w-full"
                                            >
                                                Apply Filters
                                            </button>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="btn-outline w-full text-sm"
                                                >
                                                    Clear All Filters
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Desktop Search and Filter Bar */}
                    <div className="hidden lg:block card p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
                            {/* Search Input */}
                            <div className="lg:col-span-4">
                                <label className="form-label">
                                    Search Properties
                                </label>
                                <div className="relative">
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by title, location, or type..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input pl-10 pr-8"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Property Type Filter */}
                            <div className="lg:col-span-3">
                                <label className="form-label">
                                    <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                    Property Type
                                </label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Types</option>
                                    {propertyTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="lg:col-span-3">
                                <label className="form-label">
                                    <FontAwesomeIcon icon={faSort} className="mr-2" />
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="lg:col-span-2">
                                <button
                                    onClick={clearAllFilters}
                                    className="btn-outline w-full"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        {/* Active Filters Indicator */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                                {searchTerm && (
                                    <div className="badge badge-primary text-xs">
                                        Search: "{searchTerm}"
                                        <button
                                            onClick={clearSearch}
                                            className="ml-1 hover:text-primary-800 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="w-2 h-2" />
                                        </button>
                                    </div>
                                )}
                                {filterType !== "all" && (
                                    <div className="badge badge-accent text-xs">
                                        Type: {filterType}
                                        <button
                                            onClick={clearFilter}
                                            className="ml-1 hover:text-emerald-800 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="w-2 h-2" />
                                        </button>
                                    </div>
                                )}
                                {sortBy !== "newest" && (
                                    <div className="badge badge-secondary text-xs">
                                        Sorted: {sortBy.replace('-', ' ')}
                                        <button
                                            onClick={clearSort}
                                            className="ml-1 hover:text-gray-800 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="w-2 h-2" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Properties Grid */}
                    <div>
                        {filteredProperties.length === 0 ? (
                            <div className="card text-center p-6 sm:p-8 md:p-12 animate-fade-in">
                                <div className="avatar-lg mx-auto mb-4 sm:mb-6 bg-gray-100">
                                    <FontAwesomeIcon
                                        icon={properties.length === 0 ? RegularHeart : faFolderOpen}
                                        className="text-xl sm:text-2xl text-gray-400"
                                    />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                                    {properties.length === 0 ? "No favorites yet" : "No properties found"}
                                </h3>
                                <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                                    {properties.length === 0
                                        ? "Start exploring properties and add them to your favorites for easy access later."
                                        : "Try adjusting your search or filters to find what you're looking for."
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    {properties.length === 0 && (
                                        <Link
                                            href="/properties"
                                            className="btn-primary text-sm sm:text-base"
                                        >
                                            <FontAwesomeIcon icon={faRocket} className="mr-2" />
                                            Explore Properties
                                        </Link>
                                    )}
                                    {(properties.length > 0 && filteredProperties.length === 0) && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="btn-secondary text-sm sm:text-base"
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Results Count */}
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span> of{" "}
                                        <span className="font-semibold text-gray-900">{properties.length}</span> favorite properties
                                    </p>
                                </div>

                                {/* Properties Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                                    {filteredProperties.map((property) => (
                                        <PropertyCard
                                            key={property.id}
                                            property={property}
                                            onToggleFavorite={() => toggleFavorite(property.id)}
                                            isFavorite={true} // All properties in favorites page are favorited
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom CTA */}
                    {properties.length > 0 && (
                        <div className="text-center mt-8 sm:mt-12">
                            <div className="glass-card p-6 sm:p-8 text-center bg-gradient-to-r from-primary-600 to-emerald-600 text-white rounded-xl">
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                                    Found what you're looking for?
                                </h3>
                                <p className="text-primary-100 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">
                                    Ready to take the next step with your favorite properties?
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link
                                        href="/properties"
                                        className="btn-secondary bg-white text-primary-600 hover:bg-gray-50 text-sm sm:text-base"
                                    >
                                        <FontAwesomeIcon icon={faRocket} className="mr-2" />
                                        Explore More Properties
                                    </Link>
                                    <Link
                                        href="/inquiries"
                                        className="btn-outline border-white text-white hover:bg-white/10 text-sm sm:text-base"
                                    >
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                        View My Inquiries
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
