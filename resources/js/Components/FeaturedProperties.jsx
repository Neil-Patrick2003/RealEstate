import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';
import { Link } from '@inertiajs/react';

function FeaturedProperties({properties = []}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -15 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    const formatPrice = (value) => {
        if (value == null || value === undefined) return "₱0.00";

        // Convert to number
        const price = Number(value);

        // If NaN, return 0
        if (isNaN(price)) return "₱0.00";

        // 1M or more → short format
        if (price >= 1_000_000) {
            const millions = price / 1_000_000;
            const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
            return `₱${formatted}M`;
        }

        // 100K or more → format with K
        if (price >= 100_000) {
            const thousands = price / 1_000;
            const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
            return `₱${formatted}K`;
        }

        // Under 100K → normal comma formatting
        return `₱${price.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    return (
        <section ref={ref} className="py-20 bg-neutral-50">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                        Featured Properties
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Discover handpicked properties in the most desirable neighborhoods
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {properties.map((property, index) => (
                        <Link
                            key={property.id}
                            href={`/properties/${property.id}`}
                            className="no-underline block h-full"
                        >
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
                                style={{
                                    transformStyle: "preserve-3d",
                                    perspective: "1000px",
                                }}
                            >
                                {/* Image Container - Fixed Height */}
                                <div className="relative h-72 overflow-hidden flex-shrink-0">
                                    <motion.img
                                        src={property.image_url ? `/storage/${property.image_url}` : "/placeholder-property.jpg"}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        onError={(e) => {
                                            e.target.src = "/placeholder-property.jpg";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                    {/* Favorite Button */}
                                    <motion.button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // Add favorite functionality here
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors z-10"
                                    >
                                        <Heart className="w-5 h-5" />
                                    </motion.button>

                                    {/* Price Tag */}
                                    <div className="absolute bottom-4 left-4">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg"
                                        >
                                            {formatPrice(property.price)}
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Content - Flexible Height */}
                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Title with consistent 2-line height */}
                                    <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight min-h-[3.5rem]">
                                        {property.title || "Untitled Property"}
                                    </h3>

                                    {/* Address */}
                                    <div className="flex items-start text-neutral-600 mb-4 flex-shrink-0">
                                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm line-clamp-2 leading-relaxed flex-1">
                                            {property.address || "No address provided"}
                                        </span>
                                    </div>

                                    {/* Property Details - Always at bottom */}
                                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-auto flex-shrink-0">
                                        <div className="flex items-center gap-1 text-neutral-600" title="Bedrooms">
                                            <Bed className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {property.bedrooms || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-neutral-600" title="Bathrooms">
                                            <Bath className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {property.bathrooms || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-neutral-600" title="Area">
                                            <Maximize className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {property?.lot_area || property?.floor_area || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>

                {/* Empty State */}
                {properties.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Home className="w-10 h-10 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                                No Featured Properties
                            </h3>
                            <p className="text-neutral-500">
                                Check back later for new featured listings
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

export default FeaturedProperties;
