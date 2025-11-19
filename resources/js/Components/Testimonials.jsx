import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

function Testimonials() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const testimonials = [
        {
            name: "Maria Santos",
            role: "Homeowner",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
            content: "Napakadali ng proseso ng pagbili ng aming unang bahay dahil sa PropertyFinder. Ang propesyonal at maasikaso ng team, at talagang pinilit nilang hanapin ang perfect na tahanan para sa amin. Sobra kaming nasiyahan!",
            rating: 5,
        },
        {
            name: "Juan Dela Cruz",
            role: "Property Investor",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
            content: "Bilang investor, kailangan ko ng accurate na datos at mabilis na serbisyo. Parehong natugunan ng PropertyFinder. Ang kanilang market insights ay nakatulong sa akin para makapag-desisyon nang may malaking kita.",
            rating: 5,
        },
        {
            name: "Ana Reyes",
            role: "Apartment Renter",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
            content: "Ang stressful maghanap ng rental sa current market hanggang sa natuklasan ko ang PropertyFinder. Dininig nila ang aking pangangailangan at nakahanap ng magandang apartment na pasok sa budget ko sa loob lang ng dalawang linggo!",
            rating: 5,
        },
        {
            name: "Roberto Garcia",
            role: "Home Seller",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
            content: "Mas madali pala ang pagbebenta ng bahay nang gamitin namin ang PropertyFinder. Pinroseso nila nang propesyonal ang lahat at nakakuha kami ng multiple offers na mas mataas pa sa asking price. Highly recommended!",
            rating: 5,
        },
        {
            name: "Sofia Tan",
            role: "First-Time Buyer",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200",
            content: "Tinuruan ako ng team sa bawat hakbang ng buying process. Ang kanilang pasensya at expertise ang nagpaging manageable at exciting ang dating overwhelming na proseso!",
            rating: 5,
        },
        {
            name: "Miguel Lopez",
            role: "Commercial Property Owner",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
            content: "Tumulong ang PropertyFinder para makuha namin ang perfect na commercial space para sa aming expanding business. Ang kanilang kaalaman sa market at negotiation skills ay nakatipid sa amin ng libu-libo.",
            rating: 5,
        },
        {
            name: "Elena Lim",
            role: "Condominium Buyer",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
            content: "Hindi ako nagdalawang-isip na kunin ang aking dream condominium sa Makati. Ang PropertyFinder ang naging gabay ko mula sa paghahanap hanggang sa paglipat. Salamat sa inyong serbisyo!",
            rating: 5,
        },
        {
            name: "Antonio Navarro",
            role: "Real Estate Developer",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
            content: "Bilang developer, kailangan ko ng maaasahang partner sa pagbebenta ng mga property. Ang PropertyFinder ang naging perfect na partner para maipakita ang aming mga proyekto sa tamang market.",
            rating: 5,
        }
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Quote Icon */}
                            <div className="mb-4">
                                <Quote className="w-8 h-8 text-primary-500" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-neutral-300 mb-6 leading-relaxed text-sm flex-1">
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <div className="font-semibold text-white text-sm truncate">{testimonial.name}</div>
                                    <div className="text-xs text-neutral-400 truncate">{testimonial.role}</div>
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
