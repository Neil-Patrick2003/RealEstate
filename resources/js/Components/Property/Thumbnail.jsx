import React from "react";
import PropTypes from "prop-types";
import { Image as ImageIcon } from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

/**
 * Property image gallery for selecting the main image.
 * * Props:
 * - images: Array of image objects { image_url: string }
 * - activeImageUrl: The URL of the currently selected main image.
 * - onSelect: (imageUrl: string) => void - Callback to update the main image in the parent component.
 */
export default function Thumbnail({ images = [], activeImageUrl, onSelect }) {

    // Normalize the image list, ensuring the primary image (if available) is included if not already in 'images'
    const validImages = images.filter(img => img.image_url);

    if (!validImages || validImages.length === 0) {
        return (
            // Flat placeholder style: removed border, rounded-xl, and shadow
            <div className="flex items-center justify-center p-4 text-gray-400 bg-gray-100">
                <ImageIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">No secondary images available.</span>
            </div>
        );
    }

    // Function to ensure correct URL format for comparison/display
    const normalizeUrl = (url) =>
        url ? (url.startsWith('http') || url.startsWith('/storage/') ? url : `/storage/${url}`) : '';

    const normalizedActiveUrl = normalizeUrl(activeImageUrl);

    return (
        // Removed py-2, -mx-2, px-2 to integrate cleanly into the parent's padding
        <div className="flex gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {validImages.map((image, index) => {
                const url = normalizeUrl(image.image_url);
                const isActive = url === normalizedActiveUrl;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => onSelect(image.image_url)}
                        className={cn(
                            "group relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden cursor-pointer transition-all duration-200 focus:outline-none", // Removed rounded-xl
                            // Flat Active State: uses a solid 3px border
                            isActive
                                ? "border-4 border-primary" // Solid primary color border
                                : "border-4 border-transparent hover:border-gray-200" // Transparent or slight gray hover border
                        )}
                        aria-label={`View image ${index + 1}`}
                        aria-current={isActive ? 'true' : 'false'}
                    >
                        <img
                            src={url}
                            alt={`Gallery view ${index + 1}`}
                            className={cn(
                                "w-full h-full object-cover transition-opacity duration-300",
                                isActive ? "opacity-90" : "opacity-100 group-hover:opacity-80" // Subtle opacity change for active/hover
                            )}
                        />
                        {/* Removed the active overlay since the border provides enough contrast */}
                    </button>
                );
            })}
        </div>
    );
}

Thumbnail.propTypes = {
    images: PropTypes.arrayOf(PropTypes.shape({
        image_url: PropTypes.string.isRequired,
    })),
    activeImageUrl: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
};

// Ensure scrollbar-hide is defined in your global CSS
