import React from "react";

export default function MainImage({image_url, title}) {
    return (
        <div className="relative fade-in">
            <img
                src={`/storage/${image_url}`}
                alt={title}
                className="h-[500px]     w-full rounded-lg shadow-lg object-cover"/>
        </div>
    )
}
