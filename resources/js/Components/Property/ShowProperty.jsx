import PropertyHeader from "@/Components/Property/PropertyHeader.jsx";
import MainImage from "@/Components/Property/MainImage.jsx";
import Thumbnail from "@/Components/Property/Thumbnail.jsx";
import Descriptions from "@/Components/Property/Descriptions.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import AssignedAgents from "@/Components/Property/AssignedAgents.jsx";
import React from "react";

export default function ShowProperty({properties}) {
    return (
        <div className='flex flex-col gap-4 mt-4'>
            <PropertyHeader title={property.property.title} address={property.property.address} />
            <MainImage image_url={property.property.image_url} title={property.property.title} />
            <Thumbnail images={property.property.images} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2">
                    <Descriptions
                        property_type={property.property.property_type}
                        sub_type={property.property.sub_type}
                        price={property.property.price}
                        total_rooms={property.property.total_rooms}
                        bedrooms={property.property.bedrooms}
                        bathrooms={property.property.bathrooms}
                        car_slots={property.property.car_slots}
                        features={property.property.features}
                        description={property.property.description}
                    />

                    <div className="bg-white mt-6 rounded-xl shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                        <PropertyMap coordinates={property.property.coordinate} />
                    </div>

                </div>

                <div className="lg:col-span-1">
                    <AssignedAgents agents={property.agents} auth={auth} />

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                        <img
                            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/dc012d9f-6137-4d25-a18d-115e68b96429.png"
                            alt="Map location of 123 Ocean View Drive, Malibu CA showing proximity to beach and downtown"
                            className="w-full rounded-lg mb-4"/>
                        <button
                            className="w-full text-green-600 hover:text-green-800 font-medium text-sm flex items-center justify-center">
                            <i className="fas fa-expand mr-2"></i> View Full Map
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
