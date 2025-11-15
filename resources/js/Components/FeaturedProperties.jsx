import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Bed, Bath, Maximize, MapPin, Heart } from 'lucide-react';

function FeaturedProperties() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const properties = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            price: "$450,000",
            title: "Modern Family Home",
            location: "Downtown District",
            beds: 4,
            baths: 3,
            sqft: "2,400",
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
            price: "$320,000",
            title: "Luxury Apartment",
            location: "Riverside View",
            beds: 2,
            baths: 2,
            sqft: "1,200",
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            price: "$680,000",
            title: "Contemporary Villa",
            location: "Sunset Hills",
            beds: 5,
            baths: 4,
            sqft: "3,500",
        },
    ];

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
                        <motion.div
                            key={property.id}
                            variants={itemVariants}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                            style={{
                                transformStyle: "preserve-3d",
                                perspective: "1000px",
                            }}
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
                                {/* Favorite Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-colors"
                                >
                                    <Heart className="w-5 h-5" />
                                </motion.button>

                                {/* Price Tag */}
                                <div className="absolute bottom-4 left-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg"
                                    >
                                        {property.price}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
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
                                        <span className="text-sm font-medium">{property.sqft} sqft</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

export default FeaturedProperties;
