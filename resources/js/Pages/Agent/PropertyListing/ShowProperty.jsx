import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { ChevronLeft, MoveRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBath,
    faBed,
    faCar,
    faDoorClosed,
    faLayerGroup,
    faList,
    faLocationDot,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import PropertyMap from "@/Components/PropertyMap.jsx";
import CustomSlider from "@/Components/Slider/custom.slider.jsx";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {router} from "@inertiajs/react";

dayjs.extend(relativeTime);

const ListingHeader = ({ onBack, onPublish }) => (
    <div className="flex justify-between items-center px-6 mb-4  py-4 bg-white">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition"
            aria-label="Back to Listings"
        >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Listings</span>
        </button>
        <button
            onClick={onPublish}
            className="flex items-center gap-2 font-bold text-sm px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-green-700 transition"
            aria-label="Publish Listing"
        >
            <span>Publish</span>
            <MoveRight className="h-4 w-4" />
        </button>
    </div>
);

export default function ShowProperty({ propertyListing }) {
    const { property, seller } = propertyListing;
    const images = property.images ?? [];
    const features = property.features ?? [];

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(property.price);


    const handlePublish = () => {
        router.patch(`/agents/my-listings/${property.id}`);
    }

    const listingAgeInDays = dayjs().diff(dayjs(property.created_at), "day");

    const propertyDetails = [
        { icon: faBed, label: "Bedrooms", value: property.bedrooms },
        { icon: faBath, label: "Bathrooms", value: property.bathrooms },
        { icon: faCar, label: "Parking", value: property.car_slots },
        { icon: faDoorClosed, label: "Rooms", value: property.total_roomsW },
    ];



    return (
        <AgentLayout>
            <ListingHeader
                onBack={() => window.history.back()}
                onPublish={handlePublish}
            />

            <main className="max-w-9xl mx-auto px-4 md:px-6 space-y-10">
                {/* Property Overview */}
                <section className="border p-6 rounded-xl bg-white shadow-sm">
                    <header className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                                {property.address}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <p className="text-primary font-bold text-lg">
                                    {formattedPrice}
                                </p>
                                {listingAgeInDays <= 14 && (
                                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-md">
                                        New Listing
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-sm text-white bg-secondary px-3 py-1 rounded-full">
                            {property.isPresell ? "Pre-Selling" : "For Sale"}
                        </span>
                    </header>

                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                            {features.length > 0 ? (
                                features.map(feature => (
                                    <span
                                        key={feature.id}
                                        className="border px-3 py-1 rounded-full bg-gray-50"
                                    >
                                        {feature.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 italic">No features listed</span>
                            )}
                        </div>
                    </div>

                    {/* Image & Description */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-1/2 rounded-xl overflow-hidden shadow">
                            <CustomSlider>
                                {images.length > 0 ? (
                                    images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={`/storage/${img.image_url}`}
                                            alt={`Property image ${index + 1}`}
                                            className="object-cover w-full h-full"
                                        />
                                    ))
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">
                                        No images available
                                    </div>
                                )}
                            </CustomSlider>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-gray-800">Details</h2>
                                <p className="text-gray-600 whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="mt-6">
                                <div className="grid grid-cols-2 gap-4 border-t pt-6 border-dashed">
                                    {propertyDetails.map((detail, index) => (
                                        <p key={index} className="text-sm flex items-center gap-2 text-gray-700">
                                            <FontAwesomeIcon icon={detail.icon} />
                                            {detail.label}: {detail.value ?? "N/A"}
                                        </p>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row justify-between gap-4 border-t pt-6 mt-6 border-dashed text-sm text-gray-700">
                                    <p className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faLayerGroup} />
                                        {property.property_type} - {property.sub_type}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        {property.address}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faList} />
                                        Selling by - {seller.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seller Info & MapView */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <aside className="flex flex-col gap-6">
                        <div className="border rounded-xl px-4 py-6 bg-white shadow-sm">
                            <h3 className="font-bold text-xl mb-4 text-gray-800">Seller Details</h3>
                            <p className="font-medium text-gray-700">
                                {seller.name}
                                <br />
                                <span className="text-sm text-gray-500">{seller.email}</span>
                            </p>
                            <button
                                className="mt-4 bg-primary flex items-center justify-center rounded-md w-full py-2 text-white text-sm hover:bg-blue-700 transition"
                                aria-label="View agent profile"
                            >
                                <FontAwesomeIcon icon={faUser} className="mr-2" />
                                View Profile
                            </button>
                        </div>
                    </aside>

                    <div className="lg:col-span-2 h-[400px] border rounded-xl overflow-hidden shadow-sm bg-white">
                        <PropertyMap coordinates={property.coordinate} />
                    </div>
                </section>
            </main>
        </AgentLayout>
    );
}
