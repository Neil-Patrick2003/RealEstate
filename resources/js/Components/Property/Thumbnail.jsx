import React from "react";

export default function Thumbnail({image_url, images}) {
    return (
        <div className="flex flex-wrap gap-2 mt-4">
            {images.map((image, index) => (
                <img
                    key={index}
                    src={`/storage/${image.image_url}`}
                    alt={`Image ${index + 1}`}
                    className="gallery-thumbnail cursor-pointer rounded-lg border border-gray-200"/>
            ))}
        </div>
    );
}
