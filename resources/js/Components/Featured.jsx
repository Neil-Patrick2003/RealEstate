import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    Bed,
    Bath,
    Scale,
    DoorClosed,
    Heart,
    Repeat2,
    Camera,
} from "lucide-react";

export default function Featured({ featured = [] }) {


    // Format price to PHP currency
    const formatToPHP = (amount, withDecimals = true) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        }).format(amount ?? 0);

    // Format date to readable format
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Filter properties based on selected tab


    return (
        <section className="py-12 content-center max-w-7xl mx-auto bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Recently Added</p>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-text">
                        Featured Properties
                    </h1>

                </div>
            </div>

            {/* Properties Grid */}
            {featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map((property) => (
                        <article
                            key={property.id}
                            className="overflow-hidden rounded-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 flex flex-col"
                        >
                            {/* Image */}
                            <Link
                                href={`/properties/${property.id}`}
                                className="block relative group"
                            >
                                <img
                                    src={
                                        property.image_url
                                            ? `/storage/${property.image_url}`
                                            : "/images/placeholder.jpg"
                                    }
                                    alt={property.title}
                                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-40 transition-all duration-300"></div>

                                {/* Status */}
                                <p className="absolute bg-white/70 dark:bg-black/50 px-2 py-1 bottom-3 left-3 rounded font-bold text-xs text-gray-800 dark:text-gray-200">
                                    {property.isPresell ? "Pre-sell" : "For Sale"}
                                </p>

                                {/* Image count */}
                                {property.images?.length > 0 && (
                                    <p className="absolute flex items-center bg-black/60 px-2 py-1 rounded top-3 right-3 text-white font-medium text-xs">
                                        <Camera className="h-4 w-4 mr-1" />
                                        {property.images.length}
                                    </p>
                                )}
                            </Link>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-text font-bold text-lg mb-1 line-clamp-1">
                                    {property.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">
                                    {property.address}
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">
                                    Added: {formatDate(property.created_at)}
                                </p>

                                {/* Details */}
                                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                    <span className="flex items-center gap-1" title="Lot/Floor Area">
                                        <Scale className="w-4 h-4" />
                                        {property.lot_area
                                            ? `${property.lot_area} sqm`
                                            : property.floor_area
                                                ? `${property.floor_area} sqm`
                                                : "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1" title="Total Rooms">
                                        <DoorClosed className="w-4 h-4" />
                                        {property.total_rooms ?? "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1" title="Bedrooms">
                                        <Bed className="w-4 h-4" />
                                        {property.bedrooms ?? "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1" title="Bathrooms">
                                        <Bath className="w-4 h-4" />
                                        {property.bathrooms ?? "N/A"}
                                    </span>
                                </div>

                                {/* Price + Actions */}
                                <div className="flex justify-between items-center mt-auto">
                                    <p className="text-primary font-bold text-lg">
                                        {formatToPHP(property.price)}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            aria-label="Compare"
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            type="button"
                                        >
                                            <Repeat2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <button
                                            aria-label="Add to favorites"
                                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-700 transition-colors"
                                            type="button"
                                        >
                                            <Heart className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
                    No featured properties available.
                </p>
            )}
            {featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {featured.map((property) => (
                        <article
                            key={property.id}
                            className="overflow-hidden rounded-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 flex flex-col"
                        >
                            {/* Image */}
                            <Link
                                href={`/properties/${property.id}`}
                                className="block relative group"
                            >
                                <img
                                    src={
                                        property.image_url
                                            ? `/storage/${property.image_url}`
                                            : "/images/placeholder.jpg"
                                    }
                                    alt={property.title}
                                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-40 transition-all duration-300"></div>

                                {/* Status */}
                                <p className="absolute bg-white/70 dark:bg-black/50 px-2 py-1 bottom-3 left-3 rounded font-bold text-xs text-gray-800 dark:text-gray-200">
                                    {property.isPresell ? "Pre-sell" : "For Sale"}
                                </p>

                                {/* Image count */}
                                {property.images?.length > 0 && (
                                    <p className="absolute flex items-center bg-black/60 px-2 py-1 rounded top-3 right-3 text-white font-medium text-xs">
                                        <Camera className="h-4 w-4 mr-1" />
                                        {property.images.length}
                                    </p>
                                )}
                            </Link>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-text font-bold text-lg mb-1 line-clamp-1">
                                    {property.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">
                                    {property.address}
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">
                                    Added: {formatDate(property.created_at)}
                                </p>

                                {/* Details */}
                                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                    <span className="flex items-center gap-1" title="Lot/Floor Area">
                                        <Scale className="w-4 h-4" />
                                        {property.lot_area
                                            ? `${property.lot_area} sqm`
                                            : property.floor_area
                                                ? `${property.floor_area} sqm`
                                                : "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1" title="Total Rooms">
                                        <DoorClosed className="w-4 h-4" />
                                        {property.total_rooms ?? "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1" title="Bedrooms">
                                        <Bed className="w-4 h-4" />
                                        {property.bedrooms ?? "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1" title="Bathrooms">
                                        <Bath className="w-4 h-4" />
                                        {property.bathrooms ?? "N/A"}
                                    </span>
                                </div>

                                {/* Price + Actions */}
                                <div className="flex justify-between items-center mt-auto">
                                    <p className="text-primary font-bold text-lg">
                                        {formatToPHP(property.price)}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            aria-label="Compare"
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            type="button"
                                        >
                                            <Repeat2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <button
                                            aria-label="Add to favorites"
                                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-700 transition-colors"
                                            type="button"
                                        >
                                            <Heart className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
                    No featured properties available.
                </p>
            )}
        </section>
    );
}
