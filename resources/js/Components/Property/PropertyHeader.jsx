import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLocationDot} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function PropertyHeader({title, address }) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <div className="flex items-center text-gray-600 mb-6">
                <FontAwesomeIcon icon={faLocationDot} className='mr-2 text-primary'/>
                <span className="mr-4">{address}</span>
            </div>
        </div>
    )
}
