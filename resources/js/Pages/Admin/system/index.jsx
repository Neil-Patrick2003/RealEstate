import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/User'
import { useForm } from '@inertiajs/react';
import React, { useState } from 'react'

const index = () => {
    //initialize form variables using form helper in inertia
    const { data, setData, post, processing, errors } = useForm({
        name: ''
    })

    // initialise button variable
    const [ isAddPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);


    //function to open modal to add property type
    const openAddProprtyType = () => {
        setIsPropertyTypeOpen(true);
    }

    //function to close modal to add property type
    const closeAddProprtyType = () => {
        setIsPropertyTypeOpen(false);
    }

    // function to submit form
    function submitAddPropertyType(e) {
        e.preventDefault()
        post('/')
    }

    const property_type = 
    [
        {
            name: "Apartment",
            subTypes: [
                "Penthouse",
                "Loft",
                "Bedspace",
                "Room"
            ]
        },
        {
            name: "Commercial",
            subTypes: [
                "Retail",
                "Offices",
                "Building",
                "Warehouse",
                "Serviced Office",
                "Coworking Space"
            ]
        },
        {
            name: "Condominium",
            subTypes: [
                "Loft",
                "Studio",
                "Penthouse",
                "Other",
                "Condotel"
            ]
        },
        {
            name: "House",
            subTypes: [
                "Townhouse",
                "Beach House",
                "Single Family House",
                "Villas"
            ]
        },
        {
            name: "Land",
            subTypes: [
                "Beach Lot",
                "Memorial Lot",
                "Agricultural Lot",
                "Commercial Lot",
                "Residential Lot",
                "Parking Lot"
            ]
        }
    ];

    const [selectedType, setSelectedType] = useState(null);
    
    return ( 
    

    <AdminLayout>
        <h1 className='font-bold text-lg md:text-xl lg:text-2xl '>Property type</h1>
        <div className="space-y-4">
            {/* Property Type Section */}
            <div className="p-4 lg:p-6 border rounded-xl bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Property Type</h3>
                <button
                    onClick={openAddProprtyType}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Add
                </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {property_type.length > 0 ? (
                    property_type.map((type) => (
                    <div
                        key={type.name}
                        className={`p-4 border rounded-lg text-center cursor-pointer transition hover:bg-gray-50 ${
                        selectedType?.name === type.name ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedType(type)}
                    >
                        <p className="font-medium text-gray-700">{type.name}</p>
                    </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full">There’s no available property type.</p>
                )}
                </div>
            </div>

            {/* Subcategory Section */}
            <div className="p-4 lg:p-6 border rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Subcategories</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedType ? (
                    selectedType.subTypes.length > 0 ? (
                    selectedType.subTypes.map((subType, index) => (
                        <div
                        key={index}
                        className="p-3 border rounded-lg text-center bg-gray-50 text-gray-700"
                        >
                        {subType}
                        </div>
                    ))
                    ) : (
                    <p className="text-gray-500 col-span-full text-center">No subcategories available for this type.</p>
                    )
                ) : (
                    <p className="text-gray-500 col-span-full text-center">
                    Please select a property type to see subcategories.
                    </p>
                )}
                </div>
            </div>
        </div>

    </AdminLayout>
  )
}

export default index