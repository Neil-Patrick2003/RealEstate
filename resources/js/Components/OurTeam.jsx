import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Linkedin, Mail } from 'lucide-react';

function OurTeam() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const team = [
        {
            name: "Sarah Johnson",
            role: "CEO & Founder",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
            bio: "15+ years in real estate with a passion for innovation",
        },
        {
            name: "Michael Chen",
            role: "Head of Sales",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            bio: "Expert negotiator with 500+ successful transactions",
        },
        {
            name: "Emily Rodriguez",
            role: "Property Specialist",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
            bio: "Specializes in luxury residential properties",
        },
        {
            name: "David Thompson",
            role: "Investment Advisor",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
            bio: "Financial expertise in property investment",
        },
    ];

    return (
        <section ref={ref} className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                        Meet Our Team
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Dedicated professionals committed to finding your perfect property
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group bg-neutral-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <motion.img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                {/* Social Icons */}
                                <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-colors"
                                    >
                                        <Mail className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-neutral-900 mb-1">{member.name}</h3>
                                <p className="text-primary-600 font-semibold mb-3">{member.role}</p>
                                <p className="text-sm text-neutral-600">{member.bio}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default OurTeam;
