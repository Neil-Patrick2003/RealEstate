    import React from "react";
    import { Link } from "@inertiajs/react";
    import PropTypes from "prop-types";

    export default function PropertyCard({ property }) {
        const {
            id,
            title,
            image_url,
            property_type,
            beds,
            baths,
            sqft,
            price,
            floor_area,
            lot_area,
            sub_type

        } = property;

        const formattedPrice = price
            ? Number(price).toLocaleString("en-PH", {
                style: "currency",
                currency: "PHP",
                maximumFractionDigits: 0,
            })
            : "Price N/A";

        return (
            <Link
                href={`/all-properties/${id}`}
                className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
            >
                <div className="max-w-[350px] bg-white shadow-sm hover:shadow-md hover:scale-105 transition-transform duration-300 relative rounded-lg overflow-hidden">
                    <div className="relative h-48">
                        <img
                            src={image_url ? `/storage/${image_url}` : "/placeholder.jpg"}
                            alt={title || "Property image"}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="p-4 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {title || "Untitled Property"}
                        </h3>
                        <p className="text-sm text-gray-500">{property_type || "Unknown Type"}</p>


                        {property_type !== 'Land' ? (
                            <p className="text-sm text-gray-500">
                                {beds ?? "-"} Bed &middot; {baths ?? "-"} Bath &middot; {sqft ?? "-"} sqft
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                {sub_type}
                            </p>
                        )}



                        {(floor_area || lot_area) && (
                            <p className="text-sm text-gray-500">
                                {floor_area ? `Floor Area: ${floor_area} sqm` : ""}{" "}
                                {lot_area ? `• Lot Area: ${lot_area} sqm` : ""}
                            </p>
                        )}

                        <p className="text-xl font-bold text-green-600">{formattedPrice}</p>
                    </div>
                    <button className='w-full border text-primary py-2 rounded-md'>View Details</button>
                </div>
            </Link>
        );
    }

    PropertyCard.propTypes = {
        property: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string,
            image_url: PropTypes.string,
            property_type: PropTypes.string,
            beds: PropTypes.number,
            baths: PropTypes.number,
            sqft: PropTypes.number,
            price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            floor_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            lot_area: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            sub_type: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        }).isRequired,
    };
