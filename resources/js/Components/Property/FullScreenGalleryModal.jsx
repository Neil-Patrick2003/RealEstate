import React, { useState, useEffect } from "react";
import Modal from "@/Components/Modal.jsx";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const FullScreenGalleryModal = ({ show, onClose, images, startIndex }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    // Reset index when modal opens
    useEffect(() => {
        if (show) setCurrentIndex(startIndex);
    }, [show, startIndex]);

    const totalImages = images.length;
    const currentImage = images[currentIndex];

    // Helper function for consistent image URLs
    const getFullImageUrl = (url) =>
        url ? (url.startsWith('http') || url.startsWith('/storage/') ? url : `/storage/${url}`) : '';

    // Navigation logic
    const navigate = (direction) => {
        if (direction === 'next') {
            setCurrentIndex((prev) => (prev + 1) % totalImages);
        } else {
            setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
        }
    };

    // Keyboard navigation (Arrow keys and Escape)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!show) return;
            if (e.key === 'ArrowRight' && totalImages > 1) {
                navigate('next');
            } else if (e.key === 'ArrowLeft' && totalImages > 1) {
                navigate('prev');
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show, totalImages, navigate, onClose]);

    if (!show || totalImages === 0) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="7xl" closeable={false}>
            <div className="fixed inset-0 h-screen w-screen flex flex-col items-center justify-center bg-black/95 z-[60]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition z-50"
                    aria-label="Close viewer"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Navigation: Left */}
                <button
                    onClick={() => navigate('prev')}
                    className="absolute left-6 p-4 rounded-full bg-white/20 text-white hover:bg-white/40 transition z-50 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
                    aria-label="Previous image"
                    disabled={totalImages <= 1}
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>

                {/* Navigation: Right */}
                <button
                    onClick={() => navigate('next')}
                    className="absolute right-6 p-4 rounded-full bg-white/20 text-white hover:bg-white/40 transition z-50 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
                    aria-label="Next image"
                    disabled={totalImages <= 1}
                >
                    <ChevronRight className="w-8 h-8" />
                </button>

                {/* Image Display */}
                <div className="max-h-[85vh] max-w-[90vw] flex items-center justify-center">
                    <img
                        src={getFullImageUrl(currentImage?.image_url)}
                        alt={`Image ${currentIndex + 1} of ${totalImages}`}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

                {/* Counter */}
                <div className="absolute bottom-6 p-2 px-4 rounded-full bg-black/50 text-white text-sm font-semibold">
                    {currentIndex + 1} / {totalImages}
                </div>
            </div>
        </Modal>
    );
};

export default FullScreenGalleryModal;
