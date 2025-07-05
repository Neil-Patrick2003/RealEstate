import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { BedSingle, MoveRight, ScrollText } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import PropertyMap from "@/Components/PropertyMap.jsx";
import React from "react";
import CustomSlider from "@/Components/Slider/custom.slider.jsx";

dayjs.extend(relativeTime);

export default function ShowProperty({ propertyListing }) {
    const { property, seller, } = propertyListing;

    const images = property.images;
    const features = property.features;





    console.log(features);

    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(property.price);

    const timeSinceListing = dayjs(property.created_at).fromNow();
    const listingAgeInDays = dayjs().diff(dayjs(property.created_at), "day");

    return (
        <AgentLayout>
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-10">

                {/* === Property Overview Card === */}
                <section className="border w-full p-6 rounded-xl bg-white shadow-sm">
                    {/* Header Info */}
                    <header className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                            {property.address}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-primary font-bold text-lg">{formattedPrice}</p>
                            {listingAgeInDays <= 14 && (
                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-md">
                                    New Listing
                                </span>
                            )}
                        </div>
                    </header>

                    {/* Stats & Publish */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                            { features.map(feature => (
                                <div key={feature.id} className='border px-4 py-1 rounded-2xl'>
                                    {feature.name}
                                </div>
                            ))}
                        </div>

                        <button
                            className="flex items-center gap-2 font-bold text-sm px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-blue-700 transition"
                            aria-label="Publish property"
                        >
                            Publish
                            <MoveRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Image & Description Section */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Property Image */}
                        <div className="w-full lg:w-[50%]  rounded-xl overflow-hidden shadow">
                            {/*<img*/}
                            {/*    src={`/storage/${property.image_url}`}*/}
                            {/*    alt={property.title || "Property image"}*/}
                            {/*    className="w-full h-full object-cover"*/}
                            {/*    onError={(e) => {*/}
                            {/*        e.target.src = "/images/default-property.jpg";*/}
                            {/*        e.target.alt = "Default property image";*/}
                            {/*    }}*/}
                            {/*/>*/}
                            <CustomSlider>
                                {images.map((image, index) => {
                                    return <img key={index} src={`/storage/${image.image_url}`} alt={image.image_url} className='object-cover'/>;
                                })}
                            </CustomSlider>
                        </div>

                        {/* Description */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-gray-800">
                                    {property.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>
                            <div className="grid grid-cols-2  gap-4 text-sm text-gray-700">
                                {[
                                    { label: "Rooms", value: property.total_rooms },
                                    { label: "Bedrooms", value: property.bedrooms },
                                    { label: "Bathrooms", value: property.bathrooms },
                                    { label: "Car Slots", value: property.car_slots },
                                ].map(
                                    (item, index) =>
                                        item.value && (
                                            <div className="flex flex-col  gap-1" key={index}>
                                                <div className='flex-center gap-2'>
                                                    <BedSingle className="h-5 w-5 text-gray-500" />
                                                    <span>
                                                        {item.label}
                                                    </span>
                                                </div>

                                                <p className='font-bold tex-xl font-bold'>{item.value}</p>
                                            </div>
                                        )
                                )}
                            </div>
                            <div className="border-t mt-6 pt-4">
                                <div className="flex items-center text-gray-500 text-sm mb-1">
                                    <ScrollText className="h-4 w-4 mr-1" />
                                    Listed
                                </div>
                                <p className="text-xl font-semibold text-gray-700">
                                    {timeSinceListing}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === Agent Info + Map === */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Agent Info Cards */}
                    <aside className="flex flex-col gap-6">
                        {/* Agent Details */}
                        <div className="border rounded-xl px-4 py-6 bg-white shadow-sm">
                            <h3 className="font-bold text-xl mb-4 text-gray-800">Agent Details</h3>
                            <p className="font-medium text-gray-700">
                                {seller.name}
                                <br />
                                <span className="text-sm text-gray-500">{seller.email}</span>
                            </p>
                            <button
                                className="mt-4 bg-primary flex items-center justify-center rounded-md w-full py-2 text-white text-sm hover:bg-blue-700 transition"
                                aria-label="View agent profile"
                            >
                                <FontAwesomeIcon icon={faUser} className="h-4 mr-2" />
                                View Profile
                            </button>
                        </div>

                        {/* Schedule Visit */}
                        <div className="border rounded-xl px-4 py-6 bg-white shadow-sm">
                            <h3 className="font-bold text-xl mb-4 text-gray-800">Visit Property</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Schedule an in-person or virtual visit with the agent.
                            </p>
                            <button
                                className="bg-primary flex items-center justify-center rounded-md w-full py-2 text-white text-sm hover:bg-blue-700 transition"
                                aria-label="Schedule a property visit"
                            >
                                <FontAwesomeIcon icon={faUser} className="h-4 mr-2" />
                                Schedule Visit
                            </button>
                        </div>
                    </aside>

                    {/* Map View */}
                    <div className="lg:col-span-2 h-[400px] border rounded-xl overflow-hidden shadow-sm bg-white">
                        <PropertyMap coordinates={property.coordinate} />
                    </div>
                </section>
            </main>
        </AgentLayout>
    );
}
