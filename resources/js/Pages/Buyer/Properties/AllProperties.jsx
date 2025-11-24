import React, { useEffect, useState, useCallback } from "react";
import { Link, router } from "@inertiajs/react";
import MapView from "@/Pages/Buyer/Properties/MapView.jsx";
import NavBar from "@/Components/NavBar.jsx";
import Modal from "@/Components/Modal.jsx";
import ToastHandler from "@/Components/ToastHandler.jsx";

export default function AllProperties({ property_listing }) {
    const [showCard, setShowCard] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [message, setMessage] = useState("");
    const [successSent, setSuccessSent] = useState(false);

    const handleMarkerClick = useCallback((property) => {
        setSelectedProperty(property);
        setShowCard(true);
        setSuccessSent(false);
    }, []);

    const handleCloseCard = () => {
        setShowCard(false);
        setIsOpenModal(false);
        setSelectedProperty(null);
        setMessage("");
    };

    const handleSubmitInquiry = () => {
        if (!message.trim() || !selectedProperty?.property?.id) return;

        router.post(`/properties/${selectedProperty.property.id}`, { message }, {
            preserveScroll: true,
            onSuccess: () => {
                setMessage("");
                setIsOpenModal(false);
                setSuccessSent(true);
            },
        });
    };

    // Close on ESC
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") handleCloseCard();
        };
        if (showCard) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showCard]);

    const p = selectedProperty?.property ?? {};
    const a = selectedProperty?.agent ?? {};
    const images = Array.isArray(p?.images) ? p.images : [];
    const price = Number(p?.price || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastHandler />

            {/* Inquiry Modal */}
            <Modal show={isOpenModal} onClose={() => setIsOpenModal(false)} maxWidth="2xl">
                <div className="p-6 bg-white rounded-xl shadow-lg relative">
                    <button
                        onClick={() => setIsOpenModal(false)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        {a?.photo_url ? (
                            <img
                                src={`/storage/${a.photo_url}`}
                                alt={a?.name || "Agent"}
                                className="w-12 h-12 rounded-full object-cover shadow"
                                onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
                                {(a?.name || "A").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{a?.name || "Agent"}</h3>
                            <p className="text-sm text-gray-500">Licensed Property Agent</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700">Send a quick message</label>
                        <textarea
                            id="message"
                            rows={4}
                            maxLength={250}
                            placeholder="Hi, I'm interested in this property. Please contact me..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none p-3 text-sm text-gray-700 resize-none transition-colors"
                        />
                        <p className="text-sm text-gray-500 mt-1">{`${message.length}/250`}</p>
                        {successSent && (
                            <p className="text-emerald-600 text-sm mt-2 font-medium">✓ Message sent successfully!</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitInquiry}
                            disabled={!message.trim()}
                            className="bg-emerald-600 text-white font-medium px-5 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Send Message
                        </button>
                    </div>
                </div>
            </Modal>

            <NavBar />

            {/* Emerald Header Section */}
            <div className="bg-emerald-600 text-white py-6 px-4 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2">Find Your Dream Property</h1>
                        <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                            Explore available properties on the map below. Click on markers to view details and connect with agents.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-center gap-8 mt-6 flex-wrap">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{property_listing?.length || 0}</div>
                            <div className="text-emerald-100 text-sm">Properties Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {new Set(property_listing?.map(p => p.agent?.id)).size || 0}
                            </div>
                            <div className="text-emerald-100 text-sm">Active Agents</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative h-[calc(100vh-60px)]">
                {/* Map */}
                <div className="relative w-full z-0 h-full">
                    <MapView property_listing={property_listing} onMarkerClick={handleMarkerClick} />
                </div>

                {/* Floating popup card */}
                {showCard && selectedProperty && (
                    <>
                        {/* Click-away area (does not dim map; click to close) */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={handleCloseCard}
                            aria-hidden="true"
                        />

                        <div
                            className="
                fixed z-20
                left-1/2 -translate-x-1/2 bottom-4
                w-[calc(100%-1.5rem)] sm:w-[560px]
                animate-in slide-in-from-bottom-4 duration-300
              "
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                        >
                            <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 overflow-hidden border border-gray-100">
                                {/* Image with emerald accent */}
                                <div className="relative">
                                    <img
                                        src={p?.image_url ? `/storage/${p.image_url}` : "/images/placeholder.jpg"}
                                        alt={p?.title || "Property"}
                                        className="w-full h-[200px] object-cover"
                                        onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                    />
                                    <button
                                        onClick={handleCloseCard}
                                        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-700 shadow transition-colors"
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                    {/* Emerald price badge */}
                                    <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                        {price}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-1">{p?.title || "Property"}</h2>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {p?.address || "Address not specified"}
                                        </div>
                                    </div>
                                    
                                    {/* Description (clamped) */}
                                    {p?.description && (
                                        <div
                                            className="prose max-w-none text-gray-700 line-clamp-4 text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: p.description }}
                                        />
                                    )}

                                    {/* Thumbnail Images */}
                                    {images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {images.map((img) => (
                                                <img
                                                    key={img.id}
                                                    src={`/storage/${img.image_url}`}
                                                    alt={p?.title || "Property"}
                                                    className="w-28 h-20 rounded-lg object-cover ring-1 ring-gray-200 flex-shrink-0 transition-transform hover:scale-105"
                                                    onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <Link
                                            href={`/maps/property/${p?.id}`}
                                            className="flex-1 bg-emerald-600 text-white py-3 text-center rounded-md font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            View Full Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
