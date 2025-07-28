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

    const stripAndTruncate = (html, limit = 100) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const text = temp.textContent || temp.innerText || '';
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    };


    return (
        <div className="px-4 md:px-8 lg:px-32 py-6">
            <h1 className="text-black text-2xl font-bold mb-4 flex justify-between items-center">
                Recent Properties
                <Link href="/all-properties">
                    <span className="text-gray-500 text-sm">See All</span>
                </Link>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  xl:grid-cols-5  mt-6">
                {properties.map((property) => (
                    <div key={property.id}
                        className="relative w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] after:content-[''] after:absolute after:bottom-0 after:left-6 after:right-6 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-primary after:to-transparent after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
                        <div className="relative h-48 overflow-hidden">
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
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-gray-800">{property.title}</h3>
                                <span
                                    className="inline-block bg-green-100 text-primary px-2 py-1 rounded-md text-sm font-semibold">{property.isPresell ? 'Pre selling' : 'Available'}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span>{property.address}</span>
                            </div>
                            <p className="text-gray-600 mb-4">
                                {stripAndTruncate(property.description, 120)}
                            </p>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                                <div>
                                    ₱{Number(property.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}                                </div>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyList;
