import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBath,
    faBed,
    faBuilding,
    faCheckCircle,
    faDoorClosed,
    faPaperPlane,
    faRulerCombined,
    faParking
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import PrimaryButton from "@/Components/PrimaryButton.jsx";

export default function Descriptions({price, lot_area, floor_area, description, features, sub_type, total_rooms, car_slots, property, deal, auth, setIsContactSeller, setIsOpenDealForm}) {
    const formatPrice = (p) => Number(p).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 });

    return (
        <div className='w-full flex flex-col space-y-8'> {/* Consistent vertical spacing */}

            {/* Price and Action Card (Minimalist with accent border) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2"> {/* Added pt-2 to accommodate accent bar */}
                    {/* Price and Area Details */}
                    <div className="mb-4 sm:mb-0">
                        <div className="text-4xl font-extrabold text-green-700 tracking-tight">
                            {formatPrice(price)}
                        </div>
                        <div className="text-gray-500 text-base mt-2">
                            <span className='font-medium'>{lot_area} sqm Lot</span> &bull; <span className='font-medium'>{floor_area} sqm Floor</span>
                        </div>
                    </div>

                    {auth && auth.role === 'Agent' && (
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsContactSeller(true)}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                                <FontAwesomeIcon icon={faPaperPlane}  className='w-4 h-4 mr-2'/>
                                Send Request
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Property Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6"> {/* Light border instead of heavy shadow */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Description</h2> {/* Subtle border for heading */}
                <div
                    className="prose max-w-none text-gray-700 leading-relaxed mt-4"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            </div>

            {/* Property Features */}
            <div className="bg-white rounded-xl border border-gray-200 p-6"> {/* Light border */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Key Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                    {features.map((feature, index) => (
                        <div key={index}
                             className="bg-green-50 text-green-700 px-4 py-2 rounded-lg flex items-center text-sm font-medium transition duration-150 ease-in-out hover:bg-green-100"> {/* Rounded-lg for slightly sharper corners than full, less 'pill-like' */}
                            <FontAwesomeIcon icon={faCheckCircle} className='mr-2 w-4 h-4 text-green-500' /> {/* Accent color for icon */}
                            <span>{feature.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6"> {/* Light border */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Property Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-4">

                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"> {/* Lighter bg for icons */}
                            <FontAwesomeIcon icon={faBuilding} className='w-5 h-5' />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Property Type</h3>
                            <p className="text-base font-semibold text-gray-900">Single Family Home</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faRulerCombined} className='w-5 h-5' />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sub Type</h3>
                            <p className="text-base font-semibold text-gray-900">{sub_type}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faDoorClosed} className='w-5 h-5' />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Rooms</h3>
                            <p className="text-base font-semibold text-gray-900">{total_rooms}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faParking} className='w-5 h-5' />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Parking Slots</h3>
                            <p className="text-base font-semibold text-gray-900">{car_slots}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faBed} className='w-5 h-5' />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bedrooms</h3>
                            <p className="text-base font-semibold text-gray-900">5</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <FontAwesomeIcon icon={faBath} className='w-5 h-5' />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bathrooms</h3>
                            <p className="text-base font-semibold text-gray-900">6</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
