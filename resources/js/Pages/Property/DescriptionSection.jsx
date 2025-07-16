import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faRulerCombined,
    faBed,
    faBath,
    faCar, faBuilding
} from "@fortawesome/free-solid-svg-icons";

export default function DescriptionSection({
                                               title = "No title",
                                               property_type = "",
                                               sub_type = "",
                                               price = 0,
                                               address = "N/A",
                                               lot_area,
                                               floor_area,
                                               bedrooms = "—",
                                               bathrooms = "—",
                                               car_slots = "—",
                                               description = "",
                                               features = []
                                           }) {
    const area = property_type === "Land" ? lot_area : floor_area;

    console.log(lot_area);

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in delay-200">
            <div className="p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[#5C7934]">{title}</h1>
                        <div className="flex items-center text-[#FFA500]">
                            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                            <span className="font-medium">
                                {property_type} • {sub_type}
                            </span>
                        </div>
                    </div>
                    <div className="bg-[#5C7934]/10 px-6 py-3 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium">Price</p>
                        <p className="text-2xl font-bold text-[#5C7934]">{Number(price).toLocaleString('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                        })}</p>
                    </div>
                </div>

                {/* Address & Status */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-[#5C7934]">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-2" />
                        <span className="text-gray-700">{address}</span>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Available
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl text-center">
                    <Stat icon={faRulerCombined} name="Area" value={`${area} sqm`} />
                    <Stat icon={faBed} name="Bedrooms" value={bedrooms} />
                    <Stat icon={faBath} name="Bathrooms" value={bathrooms} />
                    <Stat icon={faCar} name="Garage" value={car_slots} />
                </div>

                {/* Description */}
                <div>
                    <h2 className="text-2xl font-bold text-[#5C7934] mb-4">Description</h2>
                    <div
                        className="prose max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </div>

                {/* Features */}
                <div>
                    <h2 className="text-2xl font-bold text-[#5C7934] mb-4">Features & Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                        {features.map((f) => (
                            <span key={f.id} className="feature-badge">
                {f.name}
              </span>
                        ))}
                    </div>
                </div>

                {/* Specifications placeholder or extra */}
                {/* Optional: insert custom children here */}
            </div>
        </section>
    );
}

// Subcomponent for stats
function Stat({ icon, name, value }) {
    return (
        <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={icon} className="text-2xl text-[#5C7934] mb-2" />
            <span className="text-gray-600 text-sm">{name}</span>
            <span className="font-medium text-[#5C7934]">{value}</span>
        </div>
    );
}
