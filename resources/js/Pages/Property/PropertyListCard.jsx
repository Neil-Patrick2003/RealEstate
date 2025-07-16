import React from "react";
import { Link } from "@inertiajs/react";
import PropTypes from "prop-types";

export default function PropertyListItem({ property }) {
    const {
        id,
        title,
        image_url,
        property_type,
        beds,
        baths,
        sqft,
        price,
        status,
    } = property;

    const formattedPrice = price
        ? new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            maximumFractionDigits: 0,
        }).format(Number(price))
        : "Price N/A";

    return (
        <Link
            href={`/properties/${id}`}
            className="flex items-center space-x-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            <div className="relative w-24 h-24 flex-shrink-0">
                <img
                    src={image_url ? `/storage/${image_url}` : "/placeholder.jpg"}
                    alt={title || "Property image"}
                    className="w-full h-full object-cover "
                />

            </div>

            <div className="flex-1 min-w-0 space-y-0">
                <h4 className="text-lg font-semibold text-gray-800 truncate">
                    {title || "Untitled Property"}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                    {property_type || "—"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                    {beds ?? "-"} Bed • {baths ?? "-"} Bath • {sqft ?? "-"} sqft
                </p>
            </div>

            <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-green-600">{formattedPrice}</p>
            </div>
        </Link>
    );
}

PropertyListItem.propTypes = {
    property: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string,
        image_url: PropTypes.string,
        property_type: PropTypes.string,
        beds: PropTypes.number,
        baths: PropTypes.number,
        sqft: PropTypes.number,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        status: PropTypes.string, // e.g., "For Sale", "New"
    }).isRequired,
};
