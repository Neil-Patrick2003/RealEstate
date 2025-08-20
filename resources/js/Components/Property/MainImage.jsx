import React from "react";

export default function MainImage({image_url, title}) {
    return (
        <div className="relative fade-in">
            <img
                src={`/storage/${image_url}`}
                alt={title}
                className="h-[500px]     w-full rounded-lg shadow-lg object-cover"/>
            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center">
                <i className="fas fa-heart text-red-500 mr-1"></i>
                <span className="text-sm font-medium">Save</span>
            </div>
        </div>
    )
}
