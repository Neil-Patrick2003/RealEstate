import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Zap } from 'lucide-react'; // Added Zap and UserPlus for the example

// ---
// 1. Utility Hook for Hover Intent
// ---

/**
 * Manages hover state with a slight delay to allow the mouse
 * to travel from the trigger to the dialog body without closing it.
 */
function useHoverIntent() {
    const [isHovered, setIsHovered] = useState(false);
    let timeoutId;

    const handleMouseEnter = () => {
        clearTimeout(timeoutId);
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        // Delay closing the dialog (150ms)
        timeoutId = setTimeout(() => {
            setIsHovered(false);
        }, 150);
    };

    return { isHovered, handleMouseEnter, handleMouseLeave };
}

// ---
// 2. Framer Motion Variants
// ---

const dialogVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// ---
// 3. Main Component (Responsive Positioning)
// ---

// Helper function to determine the side based on the large breakpoint (1024px)
const getResponsiveSide = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        return 'left'; // lg and up
    }
    return 'bottom'; // sm and below
};

/**
 * Renders a floating, animated dialog on hover.
 * Positions: 'left' on large screens (lg) and 'bottom' on small screens (sm).
 */
export default function ResponsiveHoverDialog({
                                                  children,
                                                  title = "Information",
                                                  dialogContent,
                                              }) {
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverIntent();
    const [responsiveSide, setResponsiveSide] = useState(getResponsiveSide);

    // Effect to check screen size and update the side on mount and resize
    useEffect(() => {
        function handleResize() {
            setResponsiveSide(getResponsiveSide());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const side = responsiveSide; // This is the dynamically calculated side

    // Determine absolute positioning classes for the DIALOG CONTAINER
    const positioningClasses = {
        right: 'left-full top-1/2 -translate-y-1/2 ml-3',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
        left: 'right-full top-1/2 -translate-y-1/2 mr-3',
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    }[side] || 'bottom-full left-1/2 -translate-x-1/2 mb-3'; // Default to bottom if something goes wrong

    // Determine classes for the ARROW (::before pseudo-element)
    const arrowClasses = {
        right: 'before:top-1/2 before:-left-2 before:-translate-y-1/2 before:border-r-white',
        bottom: 'before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-b-white',
        left: 'before:top-1/2 before:-right-2 before:-translate-y-1/2 before:border-l-white',
        top: 'before:bottom-2 before:left-1/2 before:-translate-x-1/2 before:border-t-white',
    }[side] || 'before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-b-white';


    return (
        <div
            // Crucial: The mouse events are applied to the wrapper div to capture both trigger and dialog
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* 1. Trigger Element (uses children) */}
            <div className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full">
                {/* *** THIS IS YOUR CUSTOM BUTTON/ELEMENT ***
                  The content here (the 'children' prop) is the hover target.
                */}
                {children}
            </div>

            {/* 2. Dialog Content (Animated) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dialogVariants}
                        transition={{ duration: 0.2 }}
                        className={`absolute z-50 min-w-[280px] max-w-sm ${positioningClasses}`}
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div
                            className={`
                                relative bg-white rounded-xl p-4 ring-1 ring-gray-100/80 shadow-xl

                                // Arrow Styling (Pseudo-element)
                                before:content-[''] before:absolute before:w-0 before:h-0
                                before:border-8 before:border-transparent
                                ${arrowClasses}
                            `}
                        >

                            {/* Header (uses title prop) */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900">{title}</h4>
                                <X className="w-4 h-4 text-gray-400 opacity-0 pointer-events-none" />
                            </div>

                            {/* Content (uses dialogContent prop, allows JSX) */}
                            <div className="text-sm text-gray-700 leading-relaxed">
                                {dialogContent}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

