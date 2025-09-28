import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Bed, Bath, Scale, DoorClosed, Heart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { Eye } from "lucide-react";

export default function MostViewed({ featured = [] }) {
    const [favoriteIds, setFavoriteIds] = useState([]);

    const toggleFavorite = (propertyId) => {
        setFavoriteIds((prev) =>
            prev.includes(propertyId)
                ? prev.filter((id) => id !== propertyId)
                : [...prev, propertyId]
        );

        router.post(
            `/properties/${propertyId}/favorites`,
            { id: propertyId },
            {
                preserveScroll: true,
                onSuccess: () => console.log("Added to favorites!"),
                onError: () => console.log("Failed to add to favorites"),
            }
        );
    };

    // Format price to PHP currency
    const formatToPHP = (amount, withDecimals = true) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: withDecimals ? 2 : 0,
            maximumFractionDigits: withDecimals ? 2 : 0,
        }).format(amount ?? 0);

    // Render agent or broker avatar/name


    return (
        <section className="max-w-7xl mx-auto bg-white py-16 dark:bg-gray-900">
            {/* Header */}
            <div className="text-start ">
                <p className='flex flex-row items-center gap-2 text-text mb-3'>
                    <span>
                        <Eye className='w-4 h-4' />
                    </span>
                    Popular Listings</p>
                <h2 className="text-4xl font-thin text-gray-800 mb-4">
                    Most View Properties
                </h2>
            </div>

            {/* Properties Grid */}
            {featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
                    {featured.map((property) => (
                        <article
                            key={property.id}
                            className="relative group overflow-hidden shadow-md hover:shadow-xl transition duration-500"
                        >
                            {/* Property Image */}
                            <img
                                src={
                                    property.image_url
                                        ? `/storage/${property.image_url}`
                                        : "/images/placeholder.jpg"
                                }
                                alt={property.title}
                                className="w-full h-72 sm:h-80 md:h-96 object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />

                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                            {/* Favorite Button */}
                            {/*<button*/}
                            {/*    onClick={() => toggleFavorite(property.id)}*/}
                            {/*    className="absolute top-4 right-4 px-2 pt-1.5 pb-1 rounded-full bg-white/80 hover:bg-white transition z-20"*/}
                            {/*>*/}
                            {/*    <center>*/}
                            {/*        <FontAwesomeIcon*/}
                            {/*            icon={faHeart}*/}
                            {/*            className={`w-5 h-5 ${favoriteIds.includes(property.id) ? "text-red-500" : "text-gray-600"}`}*/}
                            {/*        />*/}
                            {/*    </center>*/}

                            {/*</button>*/}

                            {/* Bottom Content */}
                            <div className="absolute bottom-0 w-full p-5 text-white transition-all duration-500">
                                {/* Title */}
                                <h3 className="text-xl font-semibold line-clamp-1 group-hover:translate-y-[-2px] transition">
                                    {property.title}
                                </h3>

                                {/* Address */}
                                <p className="text-sm text-gray-300 line-clamp-1">
                                    {property.address}
                                </p>

                                {/* Price */}
                                <h1 className="text-secondary font-bold text-2xl mt-2">
                                    {formatToPHP(property.price, false)}
                                </h1>

                                {/* Extra Details on Hover */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-4 flex flex-wrap gap-4 text-sm text-gray-200">
                                    {(property.lot_area || property.floor_area) && (
                                        <span className="flex items-center gap-1">
                                            <Scale className="w-4 h-4" />
                                            {property.lot_area ?? property.floor_area} sqm
                                        </span>
                                    )}
                                    {property.total_rooms && (
                                        <span className="flex items-center gap-1">
                                            <DoorClosed className="w-4 h-4" />
                                            {property.total_rooms}
                                        </span>
                                    )}
                                    {property.bedrooms && (
                                        <span className="flex items-center gap-1">
                                            <Bed className="w-4 h-4" />
                                            {property.bedrooms}
                                        </span>
                                    )}
                                    {property.bathrooms && (
                                        <span className="flex items-center gap-1">
                                            <Bath className="w-4 h-4" />
                                            {property.bathrooms}
                                        </span>
                                    )}
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

            {/*/!* View All Button *!/*/}
            {/*<div className="flex justify-center p-8 mt-6">*/}
            {/*    <Link href={`/all-properties`}>*/}
            {/*        <span className="relative inline-block px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg overflow-hidden transition-colors duration-300 hover:text-white group">*/}
            {/*            <span className="absolute inset-0 w-full h-full bg-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out z-0"></span>*/}
            {/*            <span className="relative z-10">View All Properties</span>*/}
            {/*        </span>*/}
            {/*    </Link>*/}
            {/*</div>*/}
        </section>
    );
}
