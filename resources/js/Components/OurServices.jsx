import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Home, Key, DollarSign, FileText, Search, Shield } from 'lucide-react';

function OurServices() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const services = [
        {
            icon: Search,
            title: "Property Search",
            description: "Advanced search tools to find your perfect property based on your specific needs and budget.",
            color: "from-primary-500 to-primary-600",
        },
        {
            icon: Home,
            title: "Property Listings",
            description: "Comprehensive database of verified properties including houses, apartments, and commercial spaces.",
            color: "from-secondary-500 to-secondary-600",
        },
        {
            icon: Key,
            title: "Rental Services",
            description: "Full-service rental assistance from property viewing to lease signing and move-in coordination.",
            color: "from-primary-600 to-primary-700",
        },
        {
            icon: DollarSign,
            title: "Property Valuation",
            description: "Professional property valuation services to help you make informed buying or selling decisions.",
            color: "from-secondary-600 to-secondary-700",
        },
        {
            icon: FileText,
            title: "Legal Assistance",
            description: "Expert legal guidance for contracts, documentation, and all property transaction requirements.",
            color: "from-primary-500 to-primary-700",
        },
        {
            icon: Shield,
            title: "Investment Consulting",
            description: "Strategic investment advice to maximize returns on your property investments.",
            color: "from-secondary-500 to-secondary-700",
        },
    ];

    return (
        <section ref={ref} className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50/30">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                        Our Services
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Comprehensive property solutions tailored to your unique needs
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-6`}
                            >
                                <service.icon className="w-8 h-8 text-white" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-neutral-600 leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default OurServices;
