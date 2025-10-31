import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as SolidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as RegularHeart } from '@fortawesome/free-regular-svg-icons';
import forsaleIcon from '../../../assets/forsale.png';

// --- Price Formatting Helper ---
const formatPesoPrice = (price) => {
    const value = Number(price);
    if (isNaN(value)) return '₱0';

    if (value >= 1000000) {
        // Millions (M)
        const millions = (value / 1000000).toFixed(2);
        return `₱${millions}M`;
    }
    if (value >= 1000) {
        // Thousands (K)
        const thousands = (value / 1000).toFixed(0); // Round to nearest thousand for K
        return `₱${thousands}K`;
    }
    // Default format for smaller numbers
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
};
// ------------------------------

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
                <Link href="/all-properties" className="text-gray-500 text-sm hover:text-blue-600 transition">
                    See All
                </Link>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  xl:grid-cols-5 gap-6 mt-6">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        // Removed bottom border animation classes
                        className="relative w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={`/storage/${property.image_url}`}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute top-4 right-4 flex items-center justify-center">
                                {/* Favourite Button */}
                                <button
                                    onClick={() => toggleFavourite(property.id)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 transition-colors ${isFavourite(property.id) ? 'text-red-500' : 'text-white hover:text-red-400'} ${loading === property.id ? 'opacity-50' : ''}`}
                                    disabled={loading === property.id}
                                >
                                    <FontAwesomeIcon
                                        icon={isFavourite(property.id) ? SolidHeart : RegularHeart}
                                        className="w-5 h-5 drop-shadow-md"
                                    />
                                </button>
                            </div>

                            {/* Pre-sell / For Sale Tag */}
                            <div className="absolute top-4 left-4 flex items-center justify-center">
                                {property.isPresell ? (
                                    <span className="bg-white bg-opacity-90 px-2 py-1 text-xs font-bold text-black rounded ring-1 ring-gray-200">
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
                                {/* Link to property details */}
                                <Link href={`/properties/${property.id}`} className="hover:text-blue-600 transition">
                                    <h3 className="text-xl font-bold text-gray-800">{property.title}</h3>
                                </Link>
                                <span
                                    className="inline-block bg-green-100 text-primary px-2 py-1 rounded-md text-sm font-semibold whitespace-nowrap">{property.isPresell ? 'Pre selling' : 'Available'}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className='text-sm line-clamp-1'>{property.address}</span>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm h-10 overflow-hidden">
                                {stripAndTruncate(property.description, 120)}
                            </p>

                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                                <div className='text-lg font-bold text-gray-900'>
                                    {/* Applied new formatting function */}
                                    {formatPesoPrice(property.price)}
                                </div>
                                <Link
                                    href={`/properties/${property.id}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyList;
