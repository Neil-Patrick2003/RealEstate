import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import {router, useForm, usePage, Link} from "@inertiajs/react";
import InputError from "@/Components/InputError.jsx";
import React, {useEffect, useRef, useState} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {CheckLine, RotateCcw, Trash2, X} from "lucide-react";
import InputLabel from "@/Components/InputLabel.jsx";
import MapWithDraw from '@/Components/MapWithDraw';
import Toggle from "@/Components/Toggle/Toggle.jsx";
import TextInput from "@/Components/TextInput.jsx";
import { MapPin, House, Building2, Building, Landmark } from "lucide-react";
import {
    faMapMarkerAlt,
    faTag,
    faRulerCombined,
    faRuler,
    faBed,
    faBath,
    faWarehouse,
    faCar, faDoorClosed, faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function Edit({property}) {
    const { data, setData, processing, post, reset, errors } = useForm({
        title: '',
        description: '',
        property_type: '',
        property_sub_type: '',
        price: '',
        address: '',
        lot_area: '',
        floor_area: '',
        total_rooms: '',
        total_bedrooms: '',
        total_bathrooms: '',
        car_slots: '',
        isPresell: false,
        image_url: '',
        feature_name: [],
        image_urls: [],
        boundary: null,
        pin: null,
        image_preview: '',
        agent_ids: [],
        allowMultipleAgent: false,
    });

    const authId = usePage().props.auth.user.id;

// Refs for the Quill editor
    const editorRef = useRef(null);
    const quillRef = useRef(null);

// UI states
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubType, setSelectedSubType] = useState(null);
    const [preview, setPreview] = useState(null);
    const [featureName, setFeatureName] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [featuresToDelete, setFeaturesToDelete] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);

// Property Type Options
    const property_type = [
        {
            name: "Apartment",
            icon: Landmark,
            subTypes: ["Penthouse", "Loft", "Bedspace", "Room"]
        },
        {
            name: "Commercial",
            icon: Building,
            subTypes: ["Retail", "Offices", "Building", "Warehouse", "Serviced Office", "Coworking Space"]
        },
        {
            name: "Condominium",
            icon: Building2,
            subTypes: ["Loft", "Studio", "Penthouse", "Other", "Condotel"]
        },
        {
            name: "House",
            icon: House,
            subTypes: ["Townhouse", "Beach House", "Single Family House", "Villas"]
        },
        {
            name: "Land",
            icon: MapPin,
            subTypes: ["Beach Lot", "Memorial Lot", "Agricultural Lot", "Commercial Lot", "Residential Lot", "Parking Lot"]
        }
    ];


//  Feature Management
    const handleFeatureNameChange = (e) => {
        setFeatureName(e.target.value);
    };

    const handleFeatureNameAdd = () => {
        if (featureName) {
            setData('feature_name', [...data.feature_name, featureName]);
            setFeatureName('');
        }
    };

    const handleFeatureNameDelete = (index) => {
        setFeatureName('');
        setData('feature_name', data.feature_name.filter((_, i) => i !== index));
    };

    const handleDeleteExistingFeature = (e, id) => {
        e.preventDefault();
        setFeaturesToDelete(prev => [...prev, id]); // Track for backend deletion
        setData('feature_name', data.feature_name.filter(f => f.id !== id)); // Remove from UI
    };


// Main Image Preview

    const handleImagePropertyChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file)); // For UI preview
            setData('image_url', file); // For upload
        }
    };


// Multiple Image Upload

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        const newPreviews = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImagePreviews(prev => [...prev, ...newPreviews]);
        setData('image_urls', [...data.image_urls, ...files]);
    };

    const handleRemoveImage = (index) => {
        const removedImage = imagePreviews[index];

        // Only mark for deletion if it's an existing image (not newly uploaded)
        if (!removedImage.file && removedImage.id) {
            setImagesToDelete(prev => [...prev, removedImage.id]);
        }

        // Remove from preview list
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        // If it's a new file, remove from image_urls data
        if (removedImage.file) {
            setData('image_urls', data.image_urls.filter((_, i) => i !== index));
        }
    };


//  Map Boundary & Pin
    const handleMapChange = ({ boundary, pin }) => {
        setData('boundary', boundary);
        setData('pin', pin);
    };


// Quill Editor Setup

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            const quill = new Quill(editorRef.current, {
                theme: "snow",
            });

            quill.on("text-change", () => {
                const html = quill.root.innerHTML;
                setData("description", html);
            });

            quillRef.current = quill;
        }
    }, []);


// Populate Form from `property` prop
    useEffect(() => {
        if (property) {
            setData(data => ({
                ...data,
                title: property.title ?? '',
                description: property.description ?? '',
                property_type: property.property_type ?? '',
                property_sub_type: property.sub_type ?? '',
                price: property.price ?? '',
                address: property.address ?? '',
                lot_area: property.lot_area ?? '',
                floor_area: property.floor_area ?? '',
                total_rooms: property.total_rooms ?? '',
                total_bedrooms: property.total_bedrooms ?? '',
                total_bathrooms: property.total_bathrooms ?? '',
                car_slots: property.car_slots ?? '',
                isPresell: property.isPresell ?? false,
                allowMultipleAgent: property.allow_multiple_agents ?? false,

                feature_name: property.features
                    ? property.features.map(f => typeof f === 'string' ? f : f.name)
                    : data.feature_name,
            }));

            setPreview(property.image_url ? `/storage/${property.image_url}` : null);

            // Set selected property type and subtype
            setSelectedType(property_type.find(type => type.name === property.property_type));
            setSelectedSubType(property.sub_type);

            // Set image previews for existing images
            if (property?.images?.length) {
                const existingImagePreviews = property.images.map(img => ({
                    file: null,
                    preview: `/storage/${img.image_url}`,
                    id: img.id
                }));
                setImagePreviews(existingImagePreviews);
            }
        } else {
            reset(); // Reset form if no property is passed
            setPreview(null);
        }
    }, [property]);


// Sync Quill Editor with Property Description
    useEffect(() => {
        if (quillRef.current && property?.description) {
            quillRef.current.root.innerHTML = property.description;
        }
    }, [property, quillRef.current]);



// Sync Map Coordinates

    useEffect(() => {
        if (property.coordinate) {
            const boundaryData = property.coordinate.find(c => c.type === 'polygon')?.coordinates;
            const pinData = property.coordinate.find(c => c.type === 'marker')?.coordinates;

            setData('boundary', boundaryData || null);
            setData('pin', pinData || null);
        }
    }, [property.coordinates]);




    return (
        <BrokerLayout>
            <div className="bg-white rounded-3xl p-8 mb-8 border border-white/20 shadow-md">
                <div
                    className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                    <div>
                        <h1 className="text-xl font-bold gradient-text mb-2">Edit Property Listing</h1>
                        <p className="text-gray-600 text-md">Update your property information and showcase its best
                            features</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">{property.status}</span>
                        </div>
                    </div>
                </div>
            </div>
            <form className="space-y-10 "
                  onSubmit={(e) => {
                      e.preventDefault();

                      router.post(route('broker.properties.update', property.id), {
                          _method: 'patch', // Laravel treats this as PATCH
                          ...data,
                          image_to_detele: imagesToDelete,
                          feature_to_delete: featuresToDelete,
                      }, {
                          forceFormData: true, // for file uploads
                      });
                  }}
            >

                <div className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-8">
                    {/* Header Section */}
                    <div className="flex items-center space-x-4">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                            <p className="text-gray-600">Essential property details</p>
                        </div>
                    </div>

                    {/* Pre-Selling Toggle */}
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                                </svg>
                                <div>
                                    <p className="font-semibold text-gray-800">Pre-selling Property</p>
                                    <p className="text-sm text-gray-600">Mark if this is a pre-construction sale</p>
                                </div>
                            </div>
                            {/*<Toggle*/}
                            {/*    name="allowMultipleAgent"*/}
                            {/*    checked={data.allowMultipleAgent}*/}
                            {/*    onChange={(val) => setData('allowMultipleAgent', val)}*/}
                            {/*    ariaLabel="Allow multiple agents"*/}
                            {/*/>*/}
                        </div>
                    </div>

                    {/* Property Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-800">Property Title*</label>
                        <TextInput
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            required
                        />
                        <InputError message={errors.title} className="text-sm text-red-500"/>
                    </div>

                    {/* Description Editor */}
                    <div className="space-y-2">
                        <p  className="text-sm font-semibold text-gray-800">Property Description</p>
                        <div
                            ref={editorRef}
                            id="editor"
                            className="bg-white rounded-md border border-gray-300"
                            style={{height: "300px"}}
                        />
                        <InputError message={errors.description} className="text-sm text-red-500"/>
                    </div>
                </div>


                <div className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Property Type</h2>
                            <p className="text-gray-600">Select the property category</p>
                        </div>
                    </div>

                    {/* Property Type Grid */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Property Type *</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {property_type.map((type) => (
                                <div
                                    key={type.name}
                                    className={`border p-5  flex flex-col items-center justify-center text-center rounded-xl cursor-pointer transition transform hover:scale-105 ${
                                        selectedType?.name === type.name ? 'bg-green-50 border-primary' : 'bg-white hover:border-primary hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setData('property_type', type.name);
                                        setSelectedSubType(null); // Reset sub-type when type changes
                                    }}
                                >
                                    <type.icon
                                        className={`w-8 h-8 mb-2 rounded-md p-1 transition ${
                                            selectedType?.name === type.name ? 'text-primary' : 'text-gray-600'
                                        }`}
                                    />
                                    <p className={`text-sm font-medium ${
                                        selectedType?.name === type.name ? 'text-primary' : 'text-gray-600'
                                    }`}>
                                        {type.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.property_type} className="mt-2"/>
                    </div>

                    {/* Property Sub-Type */}
                    {selectedType && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Property Subtype *</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {selectedType.subTypes.map((subType, index) => (
                                    <div
                                        key={index}
                                        className={`px-4 py-3 text-sm text-center rounded-xl cursor-pointer border transition-all duration-200 ${
                                            selectedSubType === subType
                                                ? 'bg-green-50 text-primary border-primary'
                                                : 'bg-white text-primary hover:bg-green-50'
                                        }`}
                                        onClick={() => {
                                            setSelectedSubType(subType);
                                            setData('property_sub_type', subType);
                                        }}
                                    >
                                        {subType}
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.sub_type} className="mt-2"/>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Property Details</h2>
                            <p className="text-gray-600">Detailed property specifications</p>
                        </div>

                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Address */}
                        <div className='col-span-2'>
                            <p className='text-text font-medium text-sm mb-1'>Address</p>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                </span>
                                <TextInput
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="pl-10 mt-1 block w-full"
                                    autoComplete="address"
                                    isFocused
                                    required
                                />
                            </div>
                            <InputError message={errors.address} className="mt-1" />
                        </div>

                        {/* Price */}
                        <div>
                            <p className='text-text font-medium text-sm mb-1'>Price</p>
                            <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                            </span>
                                <TextInput
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="pl-10 mt-1 block w-full"
                                    autoComplete="price"
                                    isFocused
                                    required
                                />
                            </div>
                            <InputError message={errors.price} className="mt-1" />
                        </div>

                        {/* Lot or Floor Area */}
                        <div>
                            <p className='text-text font-medium text-sm mb-1'>
                                {selectedType?.name === 'Land' ? 'Lot Area (m²)' : 'Floor Area (m²)'}
                            </p>
                            <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                <FontAwesomeIcon icon={selectedType?.name === 'Land' ? faRuler : faRulerCombined} />
                            </span>
                                <TextInput
                                    id={selectedType?.name === 'Land' ? "lot_area" : "floor_area"}
                                    name={selectedType?.name === 'Land' ? "lot_area" : "floor_area"}
                                    type="number"
                                    value={selectedType?.name === 'Land' ? data.lot_area : data.floor_area}
                                    onChange={(e) => setData(
                                        selectedType?.name === 'Land' ? 'lot_area' : 'floor_area',
                                        e.target.value
                                    )}
                                    className="pl-10 mt-1 block w-full"
                                    required
                                />
                            </div>
                            <InputError
                                message={selectedType?.name === 'Land' ? errors.lot_area : errors.floor_area}
                                className="mt-1"
                            />
                        </div>

                        {/* Total Rooms */}
                        <div>
                            <p className='text-text font-medium text-sm mb-1'>Total Rooms</p>
                            <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                <FontAwesomeIcon icon={faDoorClosed} />
                            </span>
                                <TextInput
                                    id="total_rooms"
                                    name="total_rooms"
                                    type="number"
                                    value={data.total_rooms}
                                    onChange={(e) => setData('total_rooms', e.target.value)}
                                    className="pl-10 mt-1 block w-full"
                                />
                            </div>
                            <InputError message={errors.total_rooms} className="mt-1" />
                        </div>

                        {/* Total Bedrooms */}
                        <div>
                            <p className='text-text font-medium text-sm mb-1'>Total Bedrooms</p>
                            <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                <FontAwesomeIcon icon={faBed} />
                            </span>
                                <TextInput
                                    id="total_bedrooms"
                                    name="total_bedrooms"
                                    type="number"
                                    value={data.total_bedrooms}
                                    onChange={(e) => setData('total_bedrooms', e.target.value)}
                                    className="pl-10 mt-1 block w-full"
                                />
                            </div>
                            <InputError message={errors.total_bedrooms} className="mt-1" />
                        </div>

                        {/* Total Bathrooms */}
                        <div>
                            <p className='text-text font-medium text-sm mb-1'>Total Bathrooms</p>
                            <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                <FontAwesomeIcon icon={faBath} />
                            </span>
                                <TextInput
                                    id="total_bathrooms"
                                    name="total_bathrooms"
                                    type="number"
                                    value={data.total_bathrooms}
                                    onChange={(e) => setData('total_bathrooms', e.target.value)}
                                    className="pl-10 mt-1 block w-full"
                                />
                            </div>
                            <InputError message={errors.total_bathrooms} className="mt-1" />
                        </div>

                        {/* Parking Slots */}
                        <div>
                            <p className='text-text font-medium text-sm mb-1'>Parking Slots</p>
                            <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                <FontAwesomeIcon icon={faCar} />
                            </span>
                                <TextInput
                                    id="car_slots"
                                    name="car_slots"
                                    type="number"
                                    value={data.car_slots}
                                    onChange={(e) => setData('car_slots', e.target.value)}
                                    className="pl-10 mt-1 block w-full"
                                />
                            </div>
                            <InputError message={errors.car_slots} className="mt-1" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Property Features</h2>
                            <p className="text-gray-600">List property features</p>
                        </div>
                    </div>
                    <div className='bg-gray-100 rounded-md p-8 mb-4'>
                        <div className="flex flex-wrap gap-2 mb-4">

                            {data.feature_name?.map((tag, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-200 text-sm text-primary"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleFeatureNameDelete(index)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Input to add tags */}
                        <div className="flex gap-2">
                            <input
                                name="feature_name"
                                type="text"
                                value={featureName}
                                onChange={handleFeatureNameChange}
                                placeholder="Enter feature name"
                                className='border w-full border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary transition-all duration-200'
                            />
                            <button
                                type="button"
                                onClick={handleFeatureNameAdd}
                                disabled={!featureName.trim()}
                                className={` text-white px-6 py-2 rounded-md hover:bg-accent transition ${featureName.trim() ? 'bg-primary' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                Add
                            </button>

                        </div>
                        <InputError message={errors.feature_name} className="mt-1"/>
                    </div>

                </div>
                <div className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="lucide lucide-image-icon lucide-image">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Main Image</h2>
                            <p className="text-gray-600">Display image in main listing</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="property_image"
                            className={`flex flex-col items-center justify-center w-full h-48 md:h-80 border-2 border-dashed rounded-xl transition ${
                                preview
                                    ? 'border-transparent'
                                    : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                            }`}
                        >
                            {!preview ? (
                                <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
                                    <div className="mb-4 bg-gray-100 rounded-full p-3">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z"/>
                                        </svg>
                                    </div>
                                    <p className="mb-1 text-lg font-semibold text-gray-700">Drag & Drop or Click
                                        to
                                        Upload</p>
                                    <p className="text-sm text-gray-500 text-center">PNG, JPG, WebP</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <img src={preview} alt="Preview"
                                         className="h-full w-full rounded-md object-cover border"/>

                                </div>
                            )}
                        </label>

                        <input
                            type="file"
                            id="property_image"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImagePropertyChange}
                        />
                        <InputError message={errors.image_url} className="mt-1"/>

                    </div>
                    <button
                        type="button"
                        onClick={() => document.getElementById('property_image')?.click()}
                        className="flex items-center justify-center w-full py-3 text-sm font-bold text-white bg-accent hover:bg-primary  rounded-full transition duration-200 border"
                    >
                        <RotateCcw className="w-5 h-5 mr-2 text-bol" />
                        Change Image
                    </button>


                </div>
                <div className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="lucide lucide-image-icon lucide-image">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                <circle cx="9" cy="9" r="2"/>
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Other Images</h2>
                            <p className="text-gray-600">List property images</p>
                        </div>
                    </div>


                    <div className="mb-6">

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {imagePreviews.map((img, index) => (
                                    <div key={index} className="relative h-48 md:h-80">
                                        <img
                                            src={img.preview}
                                            alt={`Preview ${index}`}
                                            className="w-full h-full object-cover border rounded shadow"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1  rounded-full p-1 shadow bg-red-500 text-white"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <label
                            htmlFor="image_upload"
                            className="mt-4 flex flex-col items-center justify-center w-full h-[25vh] border-2 border-dashed border-gray-300 rounded-xl bg-amber-50 cursor-pointer hover:bg-amber-100 transition"
                        >
                            <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
                                <div className="mb-4 bg-secondary rounded-full p-3">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z"
                                        />
                                    </svg>
                                </div>
                                <p className="mb-1 text-lg font-semibold text-gray-700">Drag & Drop Files Here</p>
                                <p className="text-sm text-gray-500 text-center">PNG, JPG, WebP, SVG — or click to
                                    browse</p>
                            </div>
                            <input
                                id="image_upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                        <InputError message={errors.image_urls} className="mt-2"/>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-8 border border-white/20 shadow-md space-y-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="lucide lucide-map-pin-icon lucide-map-pin">
                                <path
                                    d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Location</h2>
                            <p className="text-gray-600">Property location with boundary</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                    <MapWithDraw
                            userId={authId}
                            boundary={data.boundary}
                            pin={data.pin}
                            onChange={handleMapChange}
                            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
                        />
                    </div>

                    <InputError message={errors.boundary} className="mt-1"/>
                </div>

                <div className=" flex flex-col w-full">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`flex items-center mb-4 justify-center px-6 py-3 rounded transition font-medium text-white ${
                            processing ? 'bg-gray-400' : 'bg-primary hover:bg-accent'
                        }`}
                    >
                        <CheckLine className="w-5 h-5 mr-2" />
                        {processing ? 'Saving...' : 'Save changes'}
                    </button>

                    <Link
                        href="/broker/properties"
                        className="flex items-center justify-center w-full gap-2 border px-4 py-2 rounded text-gray-700 hover:bg-gray-100 transition"
                    >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                    </Link>


                </div>



            </form>
        </BrokerLayout>
);
}
