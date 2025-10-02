import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBath,
    faBed,
    faBuilding,
    faCircleCheck,
    faDoorClosed, faPaperPlane,
    faRulerCombined
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import PrimaryButton from "@/Components/PrimaryButton.jsx";

export default function Descriptions({price, lot_area, floor_area, description, features, sub_type, total_rooms, car_slots, property, deal, auth, setIsContactSeller, setIsOpenDealForm}) {
    return (
        <div className='w-full flex flex-col gap-6'>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <div className="text-3xl font-bold text-green-600">
                            {Number(price).toLocaleString('en-PH', {
                                style: 'currency',
                                currency: 'PHP',
                            })}
                        </div>
                        <div className="text-gray-500 text-sm mt-1">{lot_area} {floor_area} square meter</div>
                    </div>

                    {auth && auth.role === 'Buyer' && (
                        <div className="flex space-x-3">
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                                <i className="fas fa-calendar-alt mr-2"></i> Schedule Tour
                            </button>
                            {
                                property?.property_listing && <PrimaryButton  onClick={() => setIsOpenDealForm(true)}>
                                    {deal ? 'View My Offer': 'Make Offer'}
                                </PrimaryButton>
                            }
                        </div>
                    )}


                    {auth && auth.role === 'Agent' && (
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsContactSeller(true)}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors font-medium ">
                                <FontAwesomeIcon icon={faPaperPlane}  className='w-4 h-4 mr-2'/>
                                Send Request
                            </button>
                        </div>
                    )}


                </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Description</h2>
                <div
                    className="prose max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {features.map((feature, index) => (
                        <div key={index }
                             className="hover:shadow bg-green-50 text-green-600 px-4 py-2 rounded-full flex items-center">
                            <FontAwesomeIcon icon={faCircleCheck} className='mr-2' />
                            <span>{feature.name}</span>
                        </div>
                    ))}

                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faBuilding} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500">Property Type</h3>
                            <p className="text-sm text-gray-900">Single Family Home</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faRulerCombined} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500">Sub Type</h3>
                            <p className="text-sm text-gray-900">{sub_type}</p>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faDoorClosed} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500">Total Rooms</h3>
                            <p className="text-sm text-gray-900">{total_rooms}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faDoorClosed} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500">Parking Slot</h3>
                            <p className="text-sm text-gray-900">{car_slots}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faBed} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-s   m font-medium text-gray-500">Total Bedrooms</h3>
                            <p className="text-sm text-gray-900">5</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faBath} />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-500">Total Bathrooms</h3>
                            <p className="text-sm text-gray-900">6</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
