import React from "react";

export default function MainImage({image_url, title}) {
    return (
        // The relative container is still needed for any absolute overlays (like buttons in the parent)
        <div className="relative fade-in">
            <img
                src={`/storage/${image_url}`}
                alt={title}
                className="h-[500px] w-full object-cover"
            />
        </div>
    )
}
