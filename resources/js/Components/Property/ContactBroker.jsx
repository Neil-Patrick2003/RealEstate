import React from "react";
import {router} from "@inertiajs/react";

export default function ContactBroker({broker, auth, setIsOpenModal, setSelectedPerson}) {

    return (
        <div>
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Agents</h2>
                    <div className="flex flex-col space-y-4">
                            <div key={broker.id} className="bg-white border rounded-xl shadow-sm p-6 mb-6 sticky top-6">
                                <div className="flex items-center mb-4">
                                    {broker.photo_url ? (
                                        <img
                                            src={broker.image}
                                            alt={`Professional headshot of listing broker ${broker.name}`}
                                            className="h-16 w-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-400 text-white flex items-center justify-center text-xl font-bold">
                                            {broker.name?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                    )}

                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{broker.name}</h3>
                                        <p className="text-sm text-gray-500">{broker.title || 'Real Estate Broker'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {broker.contact_number && (
                                        <div className="flex items-center text-gray-600">
                                            <i className="fas fa-phone-alt text-green-600 mr-2"></i>
                                            <span>{broker.contact_number}</span>
                                        </div>
                                    )}
                                    {broker.email && (
                                        <div className="flex items-center text-gray-600">
                                            <i className="fas fa-envelope text-green-600 mr-2"></i>
                                            <span>{broker.email}</span>
                                        </div>
                                    )}
                                    {broker.address && (
                                        <div className="flex items-center text-gray-600">
                                            <i className="fas fa-building text-green-600 mr-2"></i>
                                            <span>{broker.address}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setIsOpenModal(true);
                                        setSelectedPerson(broker);
                                }}
                                    className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center bg-primary hover:bg-accent text-white`}
                                    title={
                                        !auth
                                            ? 'You must be logged in to contact an broker'
                                            : auth.role !== 'Buyer'
                                                ? 'Only buyers can contact agents'
                                                : 'Contact the broker'
                                    }
                                >
                                    <i className="fas fa-comment-alt mr-2"></i> Contact Broker
                                </button>

                            </div>
                    </div>
                </div>
        </div>
    )
}
