import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLocationDot} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function PropertyHeader({title, address, isPresell = false }) {
    return (
        <div className='flex-center-between'>
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                <div className="flex items-center text-gray-600 mb-6">
                    <FontAwesomeIcon icon={faLocationDot} className='mr-2 text-primary'/>
                    <span className="mr-4">{address}</span>
                </div>
            </div>
            <div>
                {isPresell ? (
                    <div className="bg-orange-100 text-secondary  px-4 py-2  text-sm font-medium">
                        Pre-sell
                    </div>
                ): (
                    <div className="bg-green-100 text-primary px-4 py-2  text-sm font-medium">
                        For Sale
                    </div>
                )}
            </div>

        </div>
    )
}
