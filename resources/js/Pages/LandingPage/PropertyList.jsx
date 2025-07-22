import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as SolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as RegularHeart } from '@fortawesome/free-regular-svg-icons';
import forsaleIcon from '../../../assets/forsale.png';

const PropertyList = ({ properties, favouriteIds = [] }) => {
    const [favourites, setFavourites] = useState(new Set(favouriteIds));
    const [loading, setLoading] = useState(null);

    const toggleFavourite = (propertyId) => {
        setLoading(propertyId);

        router.post(
            '/favourites',
            { property_id: propertyId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setFavourites((prev) => {
                        const updated = new Set(prev);
                        if (updated.has(propertyId)) {
                            updated.delete(propertyId);
                        } else {
                            updated.add(propertyId);
                        }
                        return updated;
                    });
                    setLoading(null);
                },
                onError: () => setLoading(null),
            }
        );
    };

    const isFavourite = (id) => favourites.has(id);

    return (
        <div className="px-4 md:px-8 lg:px-32 py-6">
            <h1 className="text-black text-2xl font-bold mb-4 flex justify-between items-center">
                Recent Properties
                <Link href="/all-properties">
                    <span className="text-gray-500 text-sm">See All</span>
                </Link>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="relative h-48">
                            <img
                                src={`/storage/${property.image_url}`}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute top-4 right-4 flex items-center justify-center">
                            {property.isPresell ? (
                                <span className="bg-white bg-opacity-100 px-2 py-1 text-xs font-bold text-black rounded ">
                                Pre-sell
                                </span>
                            ) : (
                                <div className="relative w-[70px] h-[34px]">
                                <img src={forsaleIcon} alt="For Sale" className="w-full h-full object-contain" />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white transform -translate-x-1">
                                    For Sale
                                </span>
                                </div>
                            )}
                            </div>

                            <button
                                onClick={() => toggleFavourite(property.id)}
                                disabled={loading === property.id}
                                className="absolute top-4 left-4 text-white bg-black/50 p-2 rounded-full"
                            >
                                <FontAwesomeIcon
                                    icon={isFavourite(property.id) ? SolidHeart : RegularHeart}
                                    className={`h-5 w-5 ${isFavourite(property.id) ? 'text-red-500' : 'text-white'}`}
                                />
                            </button>
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-green-700 mb-1">{property.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{property.address}</p>

                            <div className="flex justify-between items-center text-sm text-gray-700 mb-3">
                                <div>🛏 3 | 🛁 2</div>
                                <div className="font-bold text-black">₱ {Number(property.price).toLocaleString()}</div>
                            </div>

                            <Link
                                href={`/properties/${property.id}`}
                                className="block text-center bg-primary hover:bg-primary/90 text-white rounded-md py-2 font-medium transition"
                            >
                                View Property
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyList;
