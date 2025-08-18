import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import {useForm, usePage} from "@inertiajs/react";
import InputWithLabel from "@/Components/InputWithLabel.jsx";
import InputError from "@/Components/InputError.jsx";
import React, {useEffect, useRef, useState} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import {RotateCcw, Trash2} from "lucide-react";
import InputLabel from "@/Components/InputLabel.jsx";
import MapWithDraw from '@/Components/MapWithDraw';
import Toggle from "@/Components/Toggle.jsx";

export default function Create({developers}) {
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
        allowMultipleAgent: false
    });

    const authId = usePage().props.auth.user.id;
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedSubType, setSelectedSubType] = useState(null);
    const [preview, setPreview] = useState(null);
    const [featureName, setFeatureName] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);


    const handleFeatureNameChange = (e) => {
        setFeatureName(e.target.value);
    }

    const handleFeatureNameDelete = (index) => {
        setFeatureName('');
        setData('feature_name', data.feature_name.filter((_, i) => i !== index));
    }

    const handleFeatureNameAdd = () => {
        if (featureName) {
            setFeatureName('');
            setData('feature_name', [...data.feature_name, featureName]);
            setFeatureName('');
        }

    }

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            const quill = new Quill(editorRef.current, {
                theme: "snow",
            });

            quill.on("text-change", () => {
                const html = quill.root.innerHTML;
                setData("description", html);
            });

            quillRef.current = quill; // Save for later use if needed
        }
    }, []);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        const newPreviews = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImagePreviews((prev) => [...prev, ...newPreviews]);
        setData('image_urls', [...data.image_urls, ...files]);
    };

    const handleRemoveImage = (index) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setData('image_urls', data.image_urls.filter((_, i) => i !== index));
    };

    const handleMapChange = ({ boundary, pin }) => {
        setData('boundary', boundary);
        setData('pin', pin);
    };



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

    const handleImagePropertyChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file)); // Preview image instantly
            setData('image_url', file);
        }
    };

    return (
        <BrokerLayout>
            <form className="space-y-10"
              onSubmit={(e) => {
                e.preventDefault();
                console.log(data);
                post('/broker/properties/create');
              }
            }>
                <div className='flex'>
                    <h1>Project By</h1>
                    {developers.map((developer) => (
                        <input
                            key={developer.id}
                            className="flex"
                            value={developer.name}
                            onChange={() => {}} // required to avoid React warning (if you intend to make it controlled)
                            readOnly // if you don't want editing
                        />
                    ))}
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm font-medium">Pre Selling?</p>
                    <Toggle data={data} setData={setData} />
                </div>

                {/* Section: Title */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Property Title</h2>
                    <InputWithLabel
                        id="title"
                        name="title"
                        label="Property Title *"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        className="w-full"
                    />
                    <InputError message={errors.title} className="mt-1" />
                </div>

                {/* Section: Image Upload */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Upload Property Image</h2>
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
                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z"/>
                                        </svg>
                                    </div>
                                    <p className="mb-1 text-lg font-semibold text-gray-700">Drag & Drop or Click to Upload</p>
                                    <p className="text-sm text-gray-500 text-center">PNG, JPG, WebP</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <img src={preview} alt="Preview"
                                         className="h-full w-full rounded-xl object-cover shadow-md"/>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('property_image').click()}
                                        className="absolute bottom-4 right-4 flex items-center border px-4 py-2 text-sm text-white bg-primary hover:bg-accent rounded transition duration-200"
                                    >
                                        Change Image
                                        <RotateCcw className="w-5 h-5 ml-2"/>
                                    </button>
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
                        <InputError message={errors.image_url} className="mt-1" />

                    </div>

                </div>

                {/*description*/}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Property Description</h2>
                    <div ref={editorRef} id="editor" className="bg-white rounded-md border border-gray-300" style={{ height: "300px" }}/>
                    <InputError message={errors.description} className="mt-1" />
                </div>
                {/* Property Type */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Property Type *</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {property_type.map((type) => (
                            <div
                                key={type.name}
                                className={`border px-4 py-2 text-center rounded-xl cursor-pointer transition ${
                                    selectedType?.name === type.name ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-100'
                                }`}
                                onClick={() => {
                                    setSelectedType(type);
                                    setData('property_type', type.name);
                                    setSelectedSubType(null); // Reset sub-type when type changes
                                }}
                            >
                                {type.name}
                            </div>
                        ))}
                    </div>
                    <InputError message={errors.property_type} className="mt-1" />

                </div>

                {/* Subtype */}
                {selectedType && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Property Subtype *</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {selectedType.subTypes.map((subType, index) => (
                                <div
                                    key={index}
                                    className={`border px-4 py-2 text-center rounded-xl cursor-pointer transition ${
                                        selectedSubType === subType ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-100'
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
                        <InputError message={errors.sub_type} className="mt-1" />
                    </div>

                )}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputWithLabel
                        id="address"
                        name="address"
                        label="Address *"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        required
                    />
                    <InputError message={errors.address} className="mt-1" />


                    <InputWithLabel
                        id="price"
                        name="price"
                        type="number"
                        label="Price (₱) *"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        required
                    />
                    <InputError message={errors.price} className="mt-1" />


                    {selectedType?.name === "Land" ? (
                        <>
                            <InputWithLabel
                                id="lot_area"
                                name="lot_area"
                                type="number"
                                label="Lot Area (m²) *"
                                value={data.lot_area}
                                onChange={(e) => setData('lot_area', e.target.value)}
                                required
                            />
                            <InputError message={errors.lot_area} className="mt-1" />
                        </>
                        ) : (
                            <>
                                <InputWithLabel
                                    id="floor_area"
                                    name="floor_area"
                                    type="number"
                                    label="Floor Area (m²) *"
                                    value={data.floor_area}
                                    onChange={(e) => setData('floor_area', e.target.value)}
                                    required
                                />
                                <InputError message={errors.floor_area} className="mt-1" />
                            </>
                    )}

                    <InputWithLabel
                        id="total_rooms"
                        name="total_rooms"
                        type="number"
                        label="Total Rooms (Optional)"
                        value={data.total_rooms}
                        onChange={(e) => setData('total_rooms', e.target.value)}
                    />
                    <InputError message={errors.total_rooms} className="mt-1" />


                    <InputWithLabel
                        id="total_bedrooms"
                        name="total_bedrooms"
                        type="number"
                        label="Total Bedrooms (Optional)"
                        value={data.total_bedrooms}
                        onChange={(e) => setData('total_bedrooms', e.target.value)}
                    />
                    <InputError message={errors.total_bedrooms} className="mt-1" />


                    <InputWithLabel
                        id="total_bathrooms"
                        name="total_bathrooms"
                        type="number"
                        label="Total Bathrooms (Optional)"
                        value={data.total_bathrooms}
                        onChange={(e) => setData('total_bathrooms', e.target.value)}
                    />
                    <InputError message={errors.total_bedrooms} className="mt-1" />


                    <InputWithLabel
                        id="car_slots"
                        name="car_slots"
                        type="number"
                        label="Parking Slot (Optional)"
                        value={data.car_slots}
                        onChange={(e) => setData('car_slots', e.target.value)}
                    />
                    <InputError message={errors.car_slots} className="mt-1" />

                </div>

                <div className="mt-10 p-6 border border-gray-200 rounded-md">
                    <p className="text-lg font-semibold text-gray-800 mb-2">Property Features</p>

                    {/* Tags display */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {data.feature_name.map((tag, index) => (
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
                        />
                        <button
                            type="button"
                            onClick={handleFeatureNameAdd}
                            disabled={!featureName.trim()}
                            className={`bg-primary text-white px-4 py-2 rounded hover:bg-accent transition ${featureName.trim() ? '' : 'opacity-75 cursor-not-allowed'}`}
                        >
                            Add
                        </button>

                    </div>
                    <InputError message={errors.feature_name} className="mt-1" />
                </div>

                <div className="mb-6">
                    <InputLabel htmlFor="image_upload" value="Property Images" />
                    <label
                        htmlFor="image_upload"
                        className="mt-2 flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-pointer hover:bg-gray-50 transition"
                    >
                        <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
                            <div className="mb-4 bg-gray-100 rounded-full p-3">
                                <svg
                                    className="w-6 h-6 text-gray-500"
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
                            <p className="text-sm text-gray-500 text-center">PNG, JPG, WebP, SVG — or click to browse</p>
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

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-4 mt-4">
                            {imagePreviews.map((img, index) => (
                                <div key={index} className="relative w-24 h-24">
                                    <img
                                        src={img.preview}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover border rounded shadow"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <InputError message={errors.image_urls} className="mt-2" />
                </div>

                <div>
                    <MapWithDraw userId={authId} onChange={handleMapChange} />
                    <InputError message={errors.boundary} className="mt-1" />

                </div>


                <div className="mt-10">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-3 bg-primary hover:bg-blue-700 text-white text-base font-medium rounded transition"
                    >
                        Submit Property
                    </button>
                </div>


            </form>
        </BrokerLayout>
    );
}
