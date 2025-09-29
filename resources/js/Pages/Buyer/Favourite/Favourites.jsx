import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart, faHeart as SolidHeart} from "@fortawesome/free-solid-svg-icons";
import {faHeart as RegularHeart} from "@fortawesome/free-regular-svg-icons";
import {Head, Link, router} from "@inertiajs/react";
import React, {useState} from "react";
import PropertyCard from "@/Components/Property/PropertyCard.jsx";

export default function Favourites({properties, favouriteIds = []}){

    console.log(properties);
    const [favourites, setFavourites] = useState(new Set(favouriteIds));
    const [loading, setLoading] = useState(null);
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

        <BuyerLayout>
            <Head title="Favourites" />
            <div className='mt-12'>
                <p className='text-primary font-bold text-lg md:text-xl lg:text-3xl'>
                    <span>
                        <FontAwesomeIcon icon={faHeart} className='mr-2' />
                    </span>
                    My Favourites
                </p>
                <p className='text-gray-500'>
                    Shortlist your top picks and revisit them anytime.
                </p>
                <div className=' mt-6'>
                    {properties.length === 0 ? (
                        <div className=''>
                            <p className='text-center'>No Favourite.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
                            {properties.map((property) => (
                                <div key={property.id} className="snap-center flex-shrink-0 w-80">
                                    <PropertyCard property={property} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />
                                </div>
                            ))}



                        </div>
                    )}


                </div>
            </div>

        </BuyerLayout>
    );
}
