import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid, List, Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';

function PropertyListings() {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        priceRange: 'all',
        propertyType: 'all',
        bedrooms: 'all',
        location: 'all',
        sortBy: 'newest'
    });
    const [showFilters, setShowFilters] = useState(false);

    const properties = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            price: 450000,
            title: "Modern Family Home",
            location: "Downtown District",
            type: "House",
            beds: 4,
            baths: 3,
            sqft: 2400,
            date: "2024-01-15",
            featured: true
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            price: 320000,
            title: "Luxury Apartment",
            location: "Riverside View",
            type: "Apartment",
            beds: 2,
            baths: 2,
            sqft: 1200,
            date: "2024-01-14",
            featured: false
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            price: 680000,
            title: "Contemporary Villa",
            location: "Sunset Hills",
            type: "Villa",
            beds: 5,
            baths: 4,
            sqft: 3500,
            date: "2024-01-13",
            featured: true
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800",
            price: 280000,
            title: "Cozy Condo",
            location: "Downtown District",
            type: "Condo",
            beds: 2,
            baths: 1,
            sqft: 950,
            date: "2024-01-12",
            featured: false
        },
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
            price: 550000,
            title: "Spacious Townhouse",
            location: "Greenwood Park",
            type: "House",
            beds: 3,
            baths: 2,
            sqft: 1800,
            date: "2024-01-11",
            featured: false
        },
        {
            id: 6,
            image: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800",
            price: 425000,
            title: "Garden View Apartment",
            location: "Riverside View",
            type: "Apartment",
            beds: 3,
            baths: 2,
            sqft: 1400,
            date: "2024-01-10",
            featured: false
        },
        {
            id: 7,
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            price: 890000,
            title: "Luxury Estate",
            location: "Sunset Hills",
            type: "Villa",
            beds: 6,
            baths: 5,
            sqft: 4200,
            date: "2024-01-09",
            featured: true
        },
        {
            id: 8,
            image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
            price: 195000,
            title: "Starter Studio",
            location: "City Center",
            type: "Apartment",
            beds: 1,
            baths: 1,
            sqft: 600,
            date: "2024-01-08",
            featured: false
        },
        {
            id: 9,
            image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800",
            price: 720000,
            title: "Executive Penthouse",
            location: "Downtown District",
            type: "Condo",
            beds: 4,
            baths: 3,
            sqft: 2800,
            date: "2024-01-07",
            featured: true
        }
    ];

    const filteredProperties = useMemo(() => {
        let result = properties.filter(property => {
            const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPrice = filters.priceRange === 'all' ||
                (filters.priceRange === 'under300' && property.price < 300000) ||
                (filters.priceRange === '300to500' && property.price >= 300000 && property.price <= 500000) ||
                (filters.priceRange === 'over500' && property.price > 500000);
            const matchesType = filters.propertyType === 'all' || property.type === filters.propertyType;
            const matchesBeds = filters.bedrooms === 'all' || property.beds === parseInt(filters.bedrooms);
            const matchesLocation = filters.location === 'all' || property.location === filters.location;

            return matchesSearch && matchesPrice && matchesType && matchesBeds && matchesLocation;
        });

        if (filters.sortBy === 'price-low') {
            result.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'price-high') {
            result.sort((a, b) => b.price - a.price);
        } else {
            result.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return result;
    }, [searchQuery, filters]);

    const locations = [...new Set(properties.map(p => p.location))];

    return (
        <section className="min-h-screen bg-neutral-50 py-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                        Find Your Perfect Property
                    </h1>
                    <p className="text-lg text-neutral-600">
                        Browse through {properties.length} available properties in your area
                    </p>
                </div>

                {/* Search and Filters Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search by title or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-6 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            Filters
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex bg-neutral-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-neutral-200">
                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Price Range</label>
                                        <select
                                            value={filters.priceRange}
                                            onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="all">All Prices</option>
                                            <option value="under300">Under $300K</option>
                                            <option value="300to500">$300K - $500K</option>
                                            <option value="over500">Over $500K</option>
                                        </select>
                                    </div>

                                    {/* Property Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Property Type</label>
                                        <select
                                            value={filters.propertyType}
                                            onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="House">House</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Condo">Condo</option>
                                        </select>
                                    </div>

                                    {/* Bedrooms */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Bedrooms</label>
                                        <select
                                            value={filters.bedrooms}
                                            onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="all">Any</option>
                                            <option value="1">1 Bed</option>
                                            <option value="2">2 Beds</option>
                                            <option value="3">3 Beds</option>
                                            <option value="4">4 Beds</option>
                                            <option value="5">5+ Beds</option>
                                        </select>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
                                        <select
                                            value={filters.location}
                                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="all">All Locations</option>
                                            {locations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sort By */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Sort By</label>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-neutral-600">
                        Showing <span className="font-semibold text-neutral-900">{filteredProperties.length}</span> properties
                    </p>
                </div>

                {/* Property Grid/List */}
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredProperties.map((property, index) => (
                                <PropertyCard key={property.id} property={property} index={index} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {filteredProperties.map((property, index) => (
                                <PropertyListItem key={property.id} property={property} index={index} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No Results */}
                {filteredProperties.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No properties found</h3>
                        <p className="text-neutral-600">Try adjusting your filters or search criteria</p>
                    </div>
                )}
            </div>
        </section>
    );
}

function PropertyCard({ property, index }) {
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
        >
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
                <motion.img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* Featured Badge */}
                {property.featured && (
                    <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                    </div>
                )}

                {/* Favorite Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`absolute top-4 right-4 w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                        isFavorite ? 'bg-secondary-500 text-white' : 'bg-white/90 text-neutral-600 hover:bg-secondary-500 hover:text-white'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </motion.button>

                {/* Price Tag */}
                <div className="absolute bottom-4 left-4">
                    <div className="bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                        ${property.price.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center text-sm text-neutral-500 mb-2">
          <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded text-xs font-medium">
            {property.type}
          </span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {property.title}
                </h3>
                <div className="flex items-center text-neutral-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-1 text-neutral-600">
                        <Bed className="w-4 h-4" />
                        <span className="text-sm font-medium">{property.beds}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-600">
                        <Bath className="w-4 h-4" />
                        <span className="text-sm font-medium">{property.baths}</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-600">
                        <Maximize className="w-4 h-4" />
                        <span className="text-sm font-medium">{property.sqft.toLocaleString()} sqft</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function PropertyListItem({ property, index }) {
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row"
        >
            {/* Image */}
            <div className="relative md:w-80 h-64 md:h-auto overflow-hidden">
                <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {property.featured && (
                    <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                    </div>
                )}
                <div className="absolute bottom-4 left-4">
                    <div className="bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                        ${property.price.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-2">
            <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded text-sm font-medium">
              {property.type}
            </span>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsFavorite(!isFavorite)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                isFavorite ? 'bg-secondary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-secondary-500 hover:text-white'
                            }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </motion.button>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {property.title}
                    </h3>
                    <div className="flex items-center text-neutral-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{property.location}</span>
                    </div>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-6 pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-2 text-neutral-600">
                        <Bed className="w-5 h-5" />
                        <span className="font-medium">{property.beds} Beds</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                        <Bath className="w-5 h-5" />
                        <span className="font-medium">{property.baths} Baths</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                        <Maximize className="w-5 h-5" />
                        <span className="font-medium">{property.sqft.toLocaleString()} sqft</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default PropertyListings;
