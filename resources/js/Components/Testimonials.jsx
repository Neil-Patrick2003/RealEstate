import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

function Testimonials() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const testimonials = [
        {
            name: "Jessica Martinez",
            role: "Homeowner",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
            content: "PropertyFinder made buying our first home incredibly smooth. The team was professional, responsive, and truly cared about finding us the perfect place. We could not be happier!",
            rating: 5,
        },
        {
            name: "Robert Williams",
            role: "Property Investor",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
            content: "As an investor, I need accurate data and quick responses. PropertyFinder delivers on both. Their market insights have helped me make profitable decisions time and time again.",
            rating: 5,
        },
        {
            name: "Amanda Foster",
            role: "Apartment Renter",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
            content: "Finding a rental in this market was stressful until I found PropertyFinder. They listened to my needs and found me a beautiful apartment within my budget in just two weeks!",
            rating: 5,
        },
        {
            name: "James Anderson",
            role: "Home Seller",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
            content: "Selling our home was easier than expected thanks to PropertyFinder. They handled everything professionally and got us multiple offers above asking price. Highly recommend!",
            rating: 5,
        },
        {
            name: "Lisa Chen",
            role: "First-Time Buyer",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200",
            content: "The team walked me through every step of the buying process. Their patience and expertise made what seemed overwhelming become manageable and even exciting!",
            rating: 5,
        },
        {
            name: "Marcus Taylor",
            role: "Commercial Property Owner",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
            content: "PropertyFinder helped us acquire the perfect commercial space for our expanding business. Their knowledge of the market and negotiation skills saved us thousands.",
            rating: 5,
        },
    ];

    return (
        <section ref={ref} className="py-20 bg-neutral-900">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        What Our Clients Say
                    </h2>
                    <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
                        Real stories from real people who found their dream properties with us
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300"
                        >
                            <Quote className="w-10 h-10 text-primary-500 mb-4" />
                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-secondary-500 text-secondary-500" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-neutral-300 mb-6 leading-relaxed">
                                {testimonial.content}
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <div className="font-semibold text-white">{testimonial.name}</div>
                                    <div className="text-sm text-neutral-400">{testimonial.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Testimonials;
