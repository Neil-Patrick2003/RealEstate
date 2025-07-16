import React from "react";
import  { Link } from  '@inertiajs/react'

export default function PropertyCard({property}){
    return(
        <Link href={`/properties/${property.id}`}>
            <div key={property.id} className="min-w-[75%] sm:min-w-[300px] md:min-w-[350px] max-w-[350px] bg-white rounded-xl shadow-md snap-start hover:shadow-lg hover:scale-[1.02] transition relative">
                <div className="flex">
                    <img
                        src={`/storage/${property.image_url}`}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="absolute -bottom-4 right-4 z-10">
                        <button className="bg-secondary text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="p-4 pt-6 space-y-1">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-gray-500 text-sm">{property.property_type}</p>
                    <p className="text-sm text-gray-500">3 Bed · 2 Bath · 1,800 sqft</p>
                    <p className="text-xl font-bold text-green-600 mt-1">$321,900</p>
                </div>
            </div>
        </Link>
    );
}
