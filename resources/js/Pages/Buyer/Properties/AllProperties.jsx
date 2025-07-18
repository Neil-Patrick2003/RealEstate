import React, { useState } from "react";
import { Link, router } from '@inertiajs/react';
import MapView from "@/Pages/Buyer/Properties/MapView.jsx";
import NavBar from "@/Components/NavBar.jsx";
import Drawer from "@/Components/Drawer.jsx";
import Modal from "@/Components/Modal.jsx";
import ToastHandler from "@/Components/ToastHandler.jsx";

export default function AllProperties({ property_listing }) {
    const [open, setOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [message, setMessage] = useState('');
    const [successSent, setSuccessSent] = useState(false);

    const handleMarkerClick = (property) => {
        setSelectedProperty(property);
        setOpen(true);
        setSuccessSent(false);
    };

    const handleDrawerClose = () => {
        setOpen(false);
        setIsOpenModal(false);
        setSelectedProperty(null);
        setMessage('');
    };

    const handleSubmitInquiry = () => {
        if (!message.trim()) return;

        router.post(`/properties/${selectedProperty.property.id}`, { message }, {
            preserveScroll: true,
            onSuccess: () => {
                setMessage('');
                setIsOpenModal(false);
                setSuccessSent(true);
            }
        });
    };

    return (
        <div>
            <ToastHandler />

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
                        {selectedProperty?.agent?.photo_url ? (
                            <img
                                src={`/storage/${selectedProperty.agent.photo_url}`}
                                alt={selectedProperty.agent.name}
                                className="w-12 h-12 rounded-full object-cover shadow"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-lightaccent flex items-center justify-center text-primary font-bold text-xl">
                                {selectedProperty?.agent?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{selectedProperty?.agent?.name}</h3>
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
                <div className="relative w-screen z-0">
                    <MapView property_listing={property_listing} onMarkerClick={handleMarkerClick} />
                </div>

                {selectedProperty && (
                    <Drawer open={open} setOpen={handleDrawerClose} title={selectedProperty?.property.title}>
                        <div className="flex flex-col space-y-6">
                            {/* Top image & header */}
                            <div>
                                <img
                                    src={`/storage/${selectedProperty.property.image_url}`}
                                    alt={selectedProperty.property.title}
                                    className="w-full h-[200px] object-cover rounded-md"
                                />
                                <div className="p-4">
                                    <p className="text-green-600 font-extrabold text-2xl">
                                        ₱{parseFloat(selectedProperty.property.price).toLocaleString()}
                                    </p>
                                    <p className="text-gray-500 text-sm">{selectedProperty.property.address}</p>
                                </div>
                            </div>

                            {/* Agent Info */}
                            <div className="flex items-center gap-4">
                                {selectedProperty.agent?.photo_url ? (
                                    <img
                                        src={`/storage/${selectedProperty.agent.photo_url}`}
                                        alt={selectedProperty.agent.name}
                                        className="w-12 h-12 rounded-full object-cover shadow"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-lightaccent flex items-center justify-center text-primary font-bold text-xl">
                                        {selectedProperty.agent?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex justify-between items-center w-full">
                                    <div>
                                        <p className="font-semibold text-gray-800">{selectedProperty.agent.name}</p>
                                        <p className="text-gray-500 text-sm">{selectedProperty.agent.email}</p>
                                        {selectedProperty.agent?.contact_number && (
                                            <p className="text-gray-500 text-sm">{selectedProperty.agent.contact_number}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsOpenModal(true)}
                                        className="bg-secondary px-4 py-2 rounded-md text-white hover:bg-secondary/90"
                                    >
                                        Send Inquiry
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div
                                className="prose max-w-none text-text"
                                dangerouslySetInnerHTML={{ __html: selectedProperty.property.description }}
                            />

                            {/* Additional Images */}
                            {selectedProperty.property.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {selectedProperty.property.images.map((image) => (
                                        <img
                                            key={image.id}
                                            src={`/storage/${image.image_url}`}
                                            alt={selectedProperty.property.title}
                                            className="w-full h-28 object-cover rounded-xl shadow-sm"
                                        />
                                    ))}
                                </div>
                            )}

                            <Link
                                href={`/maps/property/${selectedProperty.property.id}`}
                                className="text-white w-full block py-2 text-center rounded-md bg-primary font-medium hover:bg-accent transition"
                            >
                                View Full Details
                            </Link>
                        </div>
                    </Drawer>

                )}
            </div>
        </div>
    );
}
