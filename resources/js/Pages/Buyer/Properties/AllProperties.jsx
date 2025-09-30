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
        <div>
            <ToastHandler />
            <NavBar/>

            {/* Inquiry Modal */}
            <Modal show={isOpenModal} onClose={() => setIsOpenModal(false)} maxWidth="2xl">
                <div className="p-6 bg-white rounded-xl shadow-lg relative">
                    <button
                        onClick={() => setIsOpenModal(false)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
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
                            <div className="w-12 h-12 rounded-full bg-lightaccent flex items-center justify-center text-primary font-bold text-xl">
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
                            className="mt-2 w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-700 resize-none"
                        />
                        <p className="text-sm text-gray-500 mt-1">{`${message.length}/250`}</p>
                        {successSent && (
                            <p className="text-green-600 text-sm mt-2">Message sent successfully!</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitInquiry}
                            disabled={!message.trim()}
                            className="bg-primary text-white font-medium px-5 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send Message
                        </button>
                    </div>
                </div>
            </Modal>

            <NavBar />

            <div className="mt-[60px] relative h-[calc(100vh-60px)]">
                {/* Map */}
                <div className="relative w-screen z-0 h-full">
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
              "
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                        >
                            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 overflow-hidden">
                                {/* Image */}
                                <div className="relative">
                                    <img
                                        src={p?.image_url ? `/storage/${p.image_url}` : "/images/placeholder.jpg"}
                                        alt={p?.title || "Property"}
                                        className="w-full h-[200px] object-cover"
                                        onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                    />
                                    <button
                                        onClick={handleCloseCard}
                                        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-700 shadow"
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-4">
                                    <div>
                                        <p className="text-green-600 font-extrabold text-2xl leading-tight">{price}</p>
                                        <h2 className="text-base font-semibold text-gray-900">{p?.title || "Property"}</h2>
                                        <p className="text-gray-500 text-sm">{p?.address || "—"}</p>
                                    </div>

                                    {/* Agent */}
                                    <div className="flex items-center gap-4">
                                        {a?.photo_url ? (
                                            <img
                                                src={`/storage/${a.photo_url}`}
                                                alt={a?.name || "Agent"}
                                                className="w-12 h-12 rounded-full object-cover shadow"
                                                onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-lightaccent flex items-center justify-center text-primary font-bold text-xl">
                                                {(a?.name || "A").charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center w-full">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 truncate">{a?.name || "Agent"}</p>
                                                {a?.email && <p className="text-gray-500 text-sm truncate">{a.email}</p>}
                                                {a?.contact_number && (
                                                    <p className="text-gray-500 text-sm truncate">{a.contact_number}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {a?.contact_number && (
                                                    <a
                                                        href={`tel:${a.contact_number}`}
                                                        className="px-3 py-2 rounded-md border text-sm bg-white hover:bg-gray-50"
                                                    >
                                                        Call
                                                    </a>
                                                )}
                                                {a?.email && (
                                                    <a
                                                        href={`mailto:${a.email}?subject=${encodeURIComponent(`Inquiry: ${p?.title || "Property"}`)}`}
                                                        className="px-3 py-2 rounded-md border text-sm bg-white hover:bg-gray-50"
                                                    >
                                                        Email
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setIsOpenModal(true)}
                                                    className="bg-secondary px-3 py-2 rounded-md text-white text-sm hover:bg-secondary/90"
                                                >
                                                    Send Inquiry
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description (clamped) */}
                                    {p?.description && (
                                        <div
                                            className="prose max-w-none text-text line-clamp-5"
                                            dangerouslySetInnerHTML={{ __html: p.description }}
                                        />
                                    )}

                                    {/* Thumbs (horizontal scroll if many) */}
                                    {images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {images.map((img) => (
                                                <img
                                                    key={img.id}
                                                    src={`/storage/${img.image_url}`}
                                                    alt={p?.title || "Property"}
                                                    className="w-28 h-20 rounded-lg object-cover ring-1 ring-gray-200 flex-shrink-0"
                                                    onError={(e)=> (e.currentTarget.src="/images/placeholder.jpg")}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <Link
                                        href={`/maps/property/${p?.id}`}
                                        className="text-white w-full block py-2 text-center rounded-md bg-primary font-medium hover:bg-accent transition"
                                    >
                                        View Full Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
