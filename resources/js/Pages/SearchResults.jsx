// resources/js/Pages/SearchResults.jsx
import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/NavBar';
import { motion } from "framer-motion";
import { Search, Home, MapPin, DollarSign, Bed, Bath, Square } from 'lucide-react';
import BackButton from "@/Components/BackButton.jsx";

export default function SearchResults() {
    const { props } = usePage();
    const { q: searchQuery, results } = props;

    // Function to format price in Philippine Peso with smart formatting
    const formatPrice = (price) => {
        if (!price) return '₱0';

        const numPrice = Number(price);

        if (numPrice >= 1000000) {
            // For millions: 3.2M, 10.5M, etc.
            const millions = numPrice / 1000000;
            return `₱${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
        } else if (numPrice >= 1000) {
            // For thousands: 2k, 15k, 250k, etc.
            const thousands = numPrice / 1000;
            if (thousands >= 100) {
                // For numbers like 150k, 250k (no decimal)
                return `₱${thousands.toFixed(0)}k`;
            } else {
                // For numbers like 2.5k, 15.2k
                return `₱${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
            }
        } else {
            // For numbers less than 1000
            return `₱${numPrice.toLocaleString()}`;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <>
            <Head title={`Search Results for "${searchQuery}"`} />
            <Navbar />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Header */}
                <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>

                    <div className="relative pt-32 pb-20 mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="flex-1"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <BackButton/>
                                        </div>
                                        <span className="text-emerald-100 font-medium">Search Results</span>
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                                        Properties matching "{searchQuery}"
                                    </h1>
                                    <p className="text-xl text-emerald-100 max-w-2xl">
                                        Explore our curated collection of properties that match your search criteria
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl"
                                >
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-white mb-2">
                                            {results?.length ?? 0}
                                        </div>
                                        <div className="text-emerald-100 font-medium">Properties Found</div>
                                        <div className="w-16 h-1 bg-emerald-300 rounded-full mx-auto mt-3"></div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Results Grid */}
                        {results.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                            >
                                {results.map((property, index) => (
                                    <motion.div
                                        key={property.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -5 }}
                                        className="group"
                                    >
                                        <Link href={`/properties/${property.id}`}>
                                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-emerald-200">
                                                {/* Property Image */}
                                                <div className="relative overflow-hidden">
                                                    <img
                                                        src={`/storage/${property.image}`}
                                                        alt={property.title}
                                                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute top-4 left-4">
                                                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                                                            {property.type}
                                                        </span>
                                                    </div>
                                                    <div className="absolute top-4 right-4">
                                                        <span className="bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                                                            {formatPrice(property.price)}
                                                        </span>
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>

                                                {/* Property Details */}
                                                <div className="p-6">
                                                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                                        {property.title}
                                                    </h3>

                                                    <div className="flex items-center gap-1 text-gray-600 mb-4">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="text-sm">{property.location}</span>
                                                    </div>

                                                    {/* Property Features */}
                                                    {property.features && (
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                            {property.bedrooms && (
                                                                <div className="flex items-center gap-1">
                                                                    <Bed className="w-4 h-4" />
                                                                    <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
                                                                </div>
                                                            )}
                                                            {property.bathrooms && (
                                                                <div className="flex items-center gap-1">
                                                                    <Bath className="w-4 h-4" />
                                                                    <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
                                                                </div>
                                                            )}
                                                            {property.area && (
                                                                <div className="flex items-center gap-1">
                                                                    <Square className="w-4 h-4" />
                                                                    <span>{property.area.toLocaleString()} sqm</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                        {property.description}
                                                    </p>

                                                    {/* View Details Button */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                        <span className="text-emerald-600 font-semibold text-lg">
                                                            {formatPrice(property.price)}
                                                        </span>
                                                        <span className="text-emerald-600 font-medium text-sm group-hover:underline">
                                                            View Details →
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            /* Empty State */
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-center py-16"
                            >
                                <div className="max-w-md mx-auto">
                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        No properties found
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        We couldn't find any properties matching "<span className="font-semibold">{searchQuery}</span>".
                                        Try adjusting your search terms or explore all available properties.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link
                                            href="/all-properties"
                                            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
                                        >
                                            Browse All Properties
                                        </Link>
                                        <button
                                            onClick={() => window.history.back()}
                                            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Adjust Search
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Search Tips */}
                        {results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-12 text-center"
                            >
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Not finding what you're looking for?
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Try these tips to improve your search:
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                                        <span className="bg-white px-4 py-2 rounded-full border border-emerald-200 text-gray-700">
                                            Use more specific location names
                                        </span>
                                        <span className="bg-white px-4 py-2 rounded-full border border-emerald-200 text-gray-700">
                                            Try different property types
                                        </span>
                                        <span className="bg-white px-4 py-2 rounded-full border border-emerald-200 text-gray-700">
                                            Adjust price range filters
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
