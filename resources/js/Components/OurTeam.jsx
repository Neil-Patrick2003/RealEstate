import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { Linkedin, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

function OurTeam({ members }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [loadedImages, setLoadedImages] = useState({});

    // Responsive slides calculation
    const getSlidesToShow = () => {
        if (typeof window === 'undefined') return 4;

        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 4;
    };

    const [slidesToShow, setSlidesToShow] = useState(getSlidesToShow());

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setSlidesToShow(getSlidesToShow());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const totalSlides = useMemo(() =>
            Math.ceil(members.length / slidesToShow),
        [members.length, slidesToShow]
    );

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    const goToSlide = useCallback((index) => {
        setCurrentSlide(index);
    }, []);

    // Auto-slide functionality
    useEffect(() => {
        if (!isAutoPlaying || totalSlides <= 1) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, currentSlide, nextSlide, totalSlides]);

    const handleMouseEnter = useCallback(() => setIsAutoPlaying(false), []);
    const handleMouseLeave = useCallback(() => setIsAutoPlaying(true), []);

    const getVisibleTeamMembers = useCallback(() => {
        const startIndex = currentSlide * slidesToShow;
        return members.slice(startIndex, startIndex + slidesToShow);
    }, [currentSlide, slidesToShow, members]);

    // Get initial letter from name
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // Generate background color based on name for consistency
    const getBackgroundColor = (name) => {
        const colors = [
            'bg-primary-500', 'bg-secondary-500', 'bg-accent-500',
            'bg-green-500', 'bg-blue-500', 'bg-purple-500',
            'bg-pink-500', 'bg-orange-500', 'bg-teal-500'
        ];
        if (!name) return colors[0];

        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Image loading handler
    const handleImageLoad = useCallback((memberId) => {
        setLoadedImages(prev => ({ ...prev, [memberId]: true }));
    }, []);

    const handleImageError = useCallback((memberId) => {
        setLoadedImages(prev => ({ ...prev, [memberId]: false }));
    }, []);

    const visibleMembers = getVisibleTeamMembers();

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [prevSlide, nextSlide]);

    return (
        <section
            ref={ref}
            className="py-20 bg-white"
            aria-labelledby="team-section-title"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2
                        id="team-section-title"
                        className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4"
                    >
                        Meet Our Team
                    </h2>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Dedicated professionals committed to finding your perfect property
                    </p>
                </motion.div>

                {/* Carousel Container */}
                <div
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    role="region"
                    aria-label="Team members carousel"
                >
                    {/* Navigation Arrows - Only show if multiple slides */}
                    {totalSlides > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                aria-label="Previous team members"
                            >
                                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-neutral-700" />
                            </button>

                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                aria-label="Next team members"
                            >
                                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-neutral-700" />
                            </button>
                        </>
                    )}

                    {/* Team Grid */}
                    <div className="overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 p-4"
                            >
                                {visibleMembers.map((member, index) => {
                                    const hasPhoto = member.photo_url;
                                    const memberId = member.id || member.name;
                                    const isImageLoaded = loadedImages[memberId];
                                    const showFallback = !hasPhoto || !isImageLoaded;

                                    return (
                                        <motion.div
                                            key={`${memberId}-${currentSlide}-${index}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                            whileHover={{ y: -8 }}
                                            className="group bg-neutral-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                                        >
                                            <div className="relative h-64 overflow-hidden flex-shrink-0">
                                                {hasPhoto && !isImageLoaded && (
                                                    <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center">
                                                        <div className={`w-20 h-20 ${getBackgroundColor(member.name)} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                                                            {getInitial(member.name)}
                                                        </div>
                                                    </div>
                                                )}

                                                {hasPhoto ? (
                                                    <motion.img
                                                        src={`/storage/${member.photo_url}`}
                                                        alt={`Portrait of ${member.name}, ${member.role}`}
                                                        className="w-full h-full object-cover"
                                                        whileHover={{ scale: 1.05 }}
                                                        transition={{ duration: 0.6 }}
                                                        onLoad={() => handleImageLoad(memberId)}
                                                        onError={() => handleImageError(memberId)}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full ${getBackgroundColor(member.name)} flex items-center justify-center`}>
                                                        <span className="text-white text-6xl font-bold">
                                                            {getInitial(member.name)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                                                {/* Social Icons */}
                                                <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                                    {member.linkedin && (
                                                        <motion.a
                                                            href={member.linkedin}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                            aria-label={`Connect with ${member.name} on LinkedIn`}
                                                        >
                                                            <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                                                        </motion.a>
                                                    )}
                                                    {member.email && (
                                                        <motion.a
                                                            href={`mailto:${member.email}`}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-secondary-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500"
                                                            aria-label={`Email ${member.name}`}
                                                        >
                                                            <Mail className="w-4 h-4 md:w-5 md:h-5" />
                                                        </motion.a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-6 flex-grow">
                                                <h3 className="text-xl font-bold text-neutral-900 mb-1">{member.name}</h3>
                                                <p className="text-primary-600 font-semibold mb-3">{member.role}</p>
                                                <p className="text-sm text-neutral-600 leading-relaxed">{member.bio}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {totalSlides > 1 && (
                        <div className="flex justify-center mt-8 space-x-2" role="tablist" aria-label="Team member slides">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                        index === currentSlide
                                            ? 'bg-primary-600 w-8'
                                            : 'bg-neutral-300 hover:bg-neutral-400'
                                    }`}
                                    role="tab"
                                    aria-selected={index === currentSlide}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Screen reader announcement for slide changes */}
                    <div aria-live="polite" aria-atomic="true" className="sr-only">
                        Slide {currentSlide + 1} of {totalSlides}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurTeam;
