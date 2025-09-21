    import React from "react";
    import { Link } from "@inertiajs/react";
    import {
        Bed,
        Bath,
        Scale,
        DoorClosed,
        Heart,
    } from "lucide-react";

    export default function MostViewed({ featured = [] }) {

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

        // Render agent or broker avatar/name
        const renderAgentOrBroker = (listing) => {
            const agents = listing?.agents ?? [];
            const broker = listing?.broker;

            if (agents.length > 0) {
                const firstAgent = agents[0];
                return (
                    <div className="flex items-center gap-2">
                        {firstAgent.image_url ? (
                            <img
                                src={firstAgent.image_url}
                                alt={firstAgent.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                                {firstAgent.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{firstAgent.name}</p>
                            <p className="text-sm text-gray-600">Real Estate Agent</p>
                        </div>
                        {agents.length > 1 && (
                            <span className="text-sm text-gray-600 ml-2">
                                +{agents.length - 1}
                            </span>
                        )}
                    </div>
                );
            }

            // Show broker fallback
            return (
                <div className="flex items-center gap-2">
                    {broker?.image_url ? (
                        <img
                            src={broker.image_url}
                            alt={broker.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                            {broker?.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="font-medium">{broker?.name}</p>
                        <p className="text-sm text-gray-600">Real Estate Agent</p>
                    </div>
                </div>
            );
        };

        return (
            <section className="py-12 max-w-7xl mx-auto bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Most Viewed <span className='text-primary'>Property</span></h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Discover our most viewed properties in the most desirable locations
                    </p>
                </div>

                {/* Properties Grid */}
                {featured.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                        {featured.map((property) => (
                            <article
                                key={property.id}
                                className="overflow-hidden rounded-xl shadow-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 flex flex-col"
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

                                    <button
                                        type="button"
                                        className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 bg-white text-primary rounded-full shadow hover:bg-gray-100 transition"
                                        aria-label="Add to favorites"
                                    >
                                        <Heart className="h-5 w-5" />
                                    </button>


                                </Link>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h1 className="text-primary font-bold text-xl mb-2 line-clamp-1">
                                        {formatToPHP(property.price)}
                                    </h1>
                                    <h3 className="text-text font-bold text-lg mb-1 line-clamp-1">
                                        {property.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-1">
                                        {property.address}
                                    </p>

                                    {/* Details */}
                                    <div className="flex flex-wrap gap-4 border-b pb-4 text-gray-600 dark:text-gray-400 mb-6 text-sm">
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

                                    {/* Agent / Broker */}
                                    <div className="mt-auto">
                                        <div className='flex-center-between'>
                                            {renderAgentOrBroker(property.property_listing)}
                                            <Link href="/login">
                                                <span className="relative inline-block px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg overflow-hidden transition-colors duration-300 hover:text-white group">
                                                    <span className="absolute inset-0 w-full h-full bg-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out z-0"></span>
                                                    <span className="relative z-10">View Details</span>
                                                </span>
                                            </Link>
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
