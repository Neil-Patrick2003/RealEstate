import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faLocationDot, faShareNodes} from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import Modal from "@/Components/Modal.jsx";
import { Send } from "lucide-react";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";


export default function SellerPostProperty({ properties }) {

    console.log(properties);

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const [isContactSeller, setIsContactSeller] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const { data, setData, post, processing } = useForm({
        property_id: "",
        message: "",
    });

    const pages = [
        { name: 'Properties', href: '/seller/properties', current: true },
    ];


    function handleSubmitInquiry() {
        if (!selectedProperty) return;

        setData("property_id", selectedProperty.id);

        post(`/agents/properties/${selectedProperty.id}/sent-inquiry`, {
            preserveScroll: true,
            only: ["flash"],
            onSuccess: () => {
                setIsContactSeller(false);
                setSelectedProperty(null);
                setData("message", "");
            },
        });
    }

    function getAreaDisplay(property) {
        if (property.property_type === "land") {
            return `${property.lot_area ?? "N/A"} sqm`;
        }
        return `${property.floor_area ?? "N/A"} sqm`;
    }

    const SendInquiryButton = ({ property }) => {

        return (
            <button
                onClick={() => {
                    setSelectedProperty(property);
                    setIsContactSeller(true);
                }}
                disabled={processing}
                className={` text-primary border border-primary font-medium px-4 py-2.5 rounded-md transition ${
                    processing ? "opacity-60 cursor-not-allowed" : "hover:bg-primary-dark"
                }`}
            >
                <Send className='h-4 w-4 '/>
            </button>
        );
    };

    const PropertyCard = ({ property }) => {
        const [imgErr, setImgErr] = useState(false);



        return (
            <article className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300 flex flex-col">

                {/* Image Section */}
                <div className="relative">
                    <img
                        src={`/storage/${property.image_url}`}
                        alt={property.title || "Property Image"}
                        onError={() => setImgErr(true)}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                    />

                    {/* Tag Top Left */}
                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-md font-medium shadow">
                      {property.property_type || "Residential"}
                    </span>

                    {/* Tag Top Right */}
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-md font-medium shadow">
                      {property.isPresell ? "Preselling" : "Available"}
                    </span>
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col flex-grow space-y-2">

                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {property.title || "Riverside Residential Lots"}
                    </h3>

                    <p className="text-sm text-gray-500 flex items-center">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-primary" />
                        {property.address || "Cedar Creek, TX"}
                    </p>

                    <div className="flex justify-between items-center">
                        <p className="text-xl font-bold text-green-600">
                            {formatter.format(property.price)}
                        </p>
                        <span className="text-sm text-gray-500">
                            {property?.lot_area || property?.floor_area || "N/A" } sqm
                          </span>
                    </div>

                    {/* Features */}
                    <div className="flex gap-2 mt-2 overflow-hidden whitespace-nowrap text-ellipsis">
                        {property.features?.slice(0, 2).map((feature, i) => (
                            <span
                                key={i}
                                title={feature.name}
                                className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md border border-green-200 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
                            >
                              {feature.name}
                            </span>
                        ))}

                        {property.features?.length > 2 && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-300 shrink-0">
                              +{property.features.length - 2} more
                            </span>
                        )}
                    </div>



                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-2">
                        <Link
                            href={`/agents/properties/${property.id}`}
                            className="flex-1 text-center py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-accent transition"
                        >
                            View Details
                        </Link>

                        <SendInquiryButton property={property} />
                    </div>
                </div>
            </article>
        );
    };

    return (
        <AgentLayout>
            {/* Inquiry Modal */}
            <Modal show={isContactSeller} onClose={() => setIsContactSeller(false)} maxWidth="2xl">
                <div className="relative bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-transform transform-gpu">

                    {/* Close Button */}
                    <button
                        onClick={() => setIsContactSeller(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none text-xl font-bold"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>

                    {/* Seller Info */}
                    <div className="flex items-center gap-4 mb-6">
                        {selectedProperty?.seller?.photo_url ? (
                            <img
                                src={`/storage/${selectedProperty?.seller?.photo_url}`}
                                alt={`${selectedProperty?.seller?.name}'s Avatar`}
                                className="w-14 h-14 rounded-full object-cover border border-secondary"
                            />
                        ) : (
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-secondary text-white text-lg font-semibold border border-secondary uppercase">
                                {selectedProperty?.seller?.name?.charAt(0)}
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedProperty?.seller?.name || "Unknown Seller"}
                            </h3>
                            <p className="text-sm text-gray-500">Seller</p>
                        </div>
                    </div>

                    {/* Message Field */}
                    <div className="mb-5">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700 block">
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            maxLength={250}
                            placeholder="Hi, I'm interested in this property. Please contact me..."
                            value={data.message}
                            onChange={(e) => setData("message", e.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-800 resize-none transition-shadow"
                        />
                        <div className="text-xs text-gray-500 text-right mt-1">
                            {`${data.message.length}/250 characters`}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            disabled={processing || data.message.trim().length === 0}
                            onClick={handleSubmitInquiry}
                            className={`bg-primary text-white font-medium px-6 py-2 rounded-md transition duration-200 shadow-sm ${
                                processing || data.message.trim().length === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-primary-dark'
                            }`}
                        >
                            {processing ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Page Header */}
            <div className="mb-6 px-4">
                <Breadcrumbs pages={pages} />
                <h1 className="text-2xl font-bold text-gray-900">All Properties</h1>
            </div>

            {/* Properties Grid */}
            <div className="px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {properties.data.length ? (
                        properties.data.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full text-center">No properties available.</p>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {properties?.links?.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center items-center p-6">
                    {properties.links.map((link, idx) =>
                        link.url ? (
                            <Link
                                key={idx}
                                href={link.url}
                                className={`px-3 py-2 rounded-md text-sm border transition ${
                                    link.active
                                        ? "bg-primary text-white font-semibold"
                                        : "bg-white text-gray-600 hover:bg-gray-100"
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={idx}
                                className="px-3 py-2 text-sm text-gray-400 bg-white border rounded-md cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    )}
                </div>
            )}
        </AgentLayout>
    );


}
