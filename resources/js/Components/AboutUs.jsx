import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Award, Users, TrendingUp, Heart } from 'lucide-react';

function AboutUs() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const stats = [
        { icon: Award, value: "15+", label: "Years Experience" },
        { icon: Users, value: "10K+", label: "Happy Clients" },
        { icon: TrendingUp, value: "95%", label: "Success Rate" },
        { icon: Heart, value: "24/7", label: "Support" },
    ];

    return (
        <section ref={ref} className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                            About PropertyFinder
                        </h2>
                        <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                            We are passionate about connecting people with their dream homes. Since 2008,
                            PropertyFinder has been the trusted partner for thousands of families seeking
                            the perfect property in their ideal neighborhood.
                        </p>
                        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                            Our mission is to make property searching simple, transparent, and enjoyable.
                            With cutting-edge technology and personalized service, we ensure every client
                            finds not just a house, but a place to call home.
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center">
                                        <stat.icon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
                                        <div className="text-sm text-neutral-600">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800"
                                alt="Modern office workspace"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent" />
                        </div>
                        {/* Decorative Element */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default AboutUs;
