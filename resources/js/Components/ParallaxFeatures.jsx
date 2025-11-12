import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Zap, Users, Map } from 'lucide-react';

function ParallaxFeatures() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [-100, 100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    const features = [
        {
            icon: Shield,
            title: "Verified Listings",
            description: "Every property is verified and authenticated for your peace of mind",
            color: "from-primary-500 to-primary-600",
        },
        {
            icon: Zap,
            title: "Advanced Filtering",
            description: "Easily narrow down properties by price, location, type, and other key features to find your perfect match.",
            color: "from-secondary-500 to-secondary-600",
        },
        {
            icon: Users,
            title: "Expert Support",
            description: "Professional agents ready to assist you throughout your journey",
            color: "from-primary-600 to-primary-700",
        },
        {
            icon: Map,
            title: "Map View",
            description: "Explore properties visually with an interactive map that shows exact locations and boundary details.",
            color: "from-secondary-600 to-secondary-700",
        }
    ];


    return (
        <section ref={ref} className="relative py-32 bg-neutral-900 overflow-hidden">
            {/* Parallax Background Elements */}
            <motion.div
                style={{ y: y1, opacity }}
                className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-500/30 to-primary-600/30 rounded-full blur-3xl"
            />
            <motion.div
                style={{ y: y2, opacity }}
                className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-secondary-500/30 to-secondary-600/30 rounded-full blur-3xl"
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Why Choose Us
                    </h2>
                    <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
                        Experience the future of property hunting with our innovative platform
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50, rotateY: -15 }}
                            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{
                                scale: 1.05,
                                rotateY: 5,
                                z: 50,
                            }}
                            className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-500"
                            style={{
                                transformStyle: "preserve-3d",
                                perspective: "1000px",
                            }}
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                            {/* Icon */}
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.6 }}
                                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                            >
                                <feature.icon className="w-8 h-8 text-white" />
                            </motion.div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-300 transition-all duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Decorative Element */}
                            <motion.div
                                className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ParallaxFeatures;
