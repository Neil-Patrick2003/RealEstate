import PropertyHeader from "@/Components/Property/PropertyHeader.jsx";
import MainImage from "@/Components/Property/MainImage.jsx";
import Thumbnail from "@/Components/Property/Thumbnail.jsx";
import Descriptions from "@/Components/Property/Descriptions.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import AssignedAgents from "@/Components/Property/AssignedAgents.jsx";
import React, {useState} from "react";
import {router} from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";

export default function SingleProperty({property, auth, agents}) {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmitInquiry = () => {
        router.post(`/properties/${property.id}`, {
                message: message
            },
            {
                preserveScroll:true,
                onSuccess: () => {
                    setMessage(''),
                        setIsOpenModal(false);
                }
            })
    }
    return (

        <div className='flex flex-col gap-4 mt-4'>
            <Modal show={isOpenModal} onClose={() => setIsOpenModal(false)} maxWidth="2xl">
                <div className="p-6 bg-white rounded-xl shadow-lg transition-transform transform-gpu">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsOpenModal(false)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>

                    {/* Agent Info */}
                    <div className="flex items-center gap-4 mb-6">
                        <img
                            src={property?.property_listing?.agent?.image_url || '/default-avatar.png'}
                            alt="Agent Avatar"
                            className="w-14 h-14 rounded-full object-cover border border-gray-300"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{property?.property_listing?.agent?.name}</h3>
                            <p className="text-sm text-gray-500">Licensed Property Agent</p>
                        </div>
                    </div>

                    {/* Message Box */}
                    <div className="mb-4">
                        <label htmlFor="message" className="text-sm font-medium text-gray-700">
                            Send a quick message
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            maxLength={250} // Character limit
                            placeholder="Hi, I'm interested in this property. Please contact me..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="mt-2 w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-700 resize-none transition-shadow duration-200"
                        />
                        <p className="text-sm text-gray-500 mt-1">{`${message.length}/250`}</p> {/* Character count */}
                    </div>

                    {/* Send Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitInquiry}
                            className="bg-primary text-white font-medium px-5 py-2 rounded-md hover:bg-primary/90 transition duration-200 shadow-sm"
                        >
                            Send Message
                        </button>
                    </div>
                </div>
            </Modal>
            <PropertyHeader title={property.title} address={property.address} isPresell={property.isPresell} />
            <MainImage image_url={property.image_url} title={property.title} />
            <Thumbnail images={property.images} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2">
                    <Descriptions
                        property_type={property.property_type}
                        sub_type={property.sub_type}
                        price={property.price}
                        total_rooms={property.total_rooms}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        car_slots={property.car_slots}
                        features={property.features}
                        description={property.description}
                        lot_area={property.lot_area}
                        floor_area={property.floor_area}
                    />

                    <div className="bg-white mt-6 rounded-xl shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                        <PropertyMap coordinates={property.coordinate} />
                    </div>

                </div>

                <div className="lg:col-span-1">
                    <AssignedAgents agents={agents} auth={auth} setIsOpenModal={setIsOpenModal} />

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
