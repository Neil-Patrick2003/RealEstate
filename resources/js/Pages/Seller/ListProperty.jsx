import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
  CirclePlus,
  CheckCircle,
  Trash2,
} from 'lucide-react';

import NavBar from '@/Components/NavBar';
import Modal from '@/Components/Modal';
import ListingRequirements from '@/Components/Stepper/ListingRequirements';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Editor from 'react-simple-wysiwyg';
import MapWithDraw from '@/Components/MapWithDraw';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import Collapsable from '@/Components/collapsable/collapsable';
import Toggle from '@/Components/toggle';


const ListProperty = () => {
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
    isPresell: '',
    image_url: '',
    feature_name: [],
    image_urls: [],
    boundary: null,
    pin: null,
    image_preview: ''
  });

  

  const [imagePreviews, setImagePreviews] = useState([]);

  const [featureInput, setFeatureInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/post-property', {
      onSuccess: () => {
        console.log("Form submitted, resetting...");
        reset();
        setImagePreviews([]);
        setFeatureInput('');
        setData('boundary', null);
        setData('pin', null);
      },
      forceFormData: true, // important for file uploads
    });
  };
    


  const handleDescriptionChange = (e) => {
    setData('description', e.target.value);
  };

  // Handles adding multiple image files
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setData('image_urls', [...data.image_urls, ...files]);
  };

  // Removes selected image preview + file
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setData('image_urls', data.image_urls.filter((_, i) => i !== index));
  };

 
  const auth = usePage().props.auth;

  // Called by PropertyMapDraw component on map changes
  const handleMapChange = ({ boundary, pin }) => {
    setData('boundary', boundary);
    setData('pin', pin);
  };

  //type
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

    const handleTypeClick = (typeName) => {
      const selected = property_type.find(type => type.name === typeName);
      setSelectedType(selected);
      setData('property_type', typeName);
    };

    const [enabled, setEnabled] = useState(false);

    const [preview, setPreview] = useState(null); // For image preview


     
    const handleImagePropertyChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPreview(URL.createObjectURL(file)); // Preview image instantly
        setData('image_url', file); // File for upload via Inertia
      }
    };




    

  

  return (
    <div className=" pt-20 bg-gray-100 min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="">
            <section className="space-y-6 p-4 md:p-6 rounded-2xl">
              <Collapsable title="Key Information" description="Detailed description about property.">
                <div className="space-y-6">

                  {/* Pre-Sell Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-xl shadow-sm bg-gray-50">
                    <span className="font-medium text-gray-700">Is Pre-sell?</span>
                    <Toggle data={data} setData={setData} />
                  </div>

                  {/* Title Input */}
                  <div>
                    <InputLabel htmlFor="title" value="Title" />
                    <TextInput
                      id="title"
                      name="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      className="mt-2 w-full"
                      placeholder="e.g. Affordable Lot for Sale in Batangas"
                      required
                    />
                    <InputError message={errors.title} className="mt-2" />
                  </div>

                  {/* Description Editor */}
                  <div>
                    <InputLabel htmlFor="description" value="Description" />
                    <Editor
                      id="select"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      className="h-60 mt-2"
                    />
                    <InputError message={errors.description} className="mt-2" />
                  </div>

                  {/* property image */}
                  <div className="flex flex-col items-center">
                    <label
                      htmlFor="property_image"
                      className={`mt-2 flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed rounded-xl transition ${
                        preview ? 'border-transparent' : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      {!preview && (
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
                          <p className="mb-2 text-lg font-semibold text-gray-700">Drag & Drop Files Here</p>
                          <p className="text-sm text-gray-500 text-center">PNG, JPG, WebP — or click to browse</p>
                        </div>
                      )}

                      {preview && (
                        <div className="flex flex-col items-center">
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-40 w-40 rounded-full object-cover shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('property_image').click()}
                            className="mt-2 px-4 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                          >
                            Change
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
                  </div>


  

                  {/* Property Type */}
                  <div>
                    <InputLabel value="Property Type" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                      {property_type.length > 0 ? (
                        property_type.map((type) => (
                          <div
                            key={type.name}
                            onClick={() => handleTypeClick(type.name)}
                            className={`p-4 border rounded-xl text-center cursor-pointer transition-all ${
                              selectedType?.name === type.name
                                ? 'bg-green-500 text-white border-green-500'
                                : 'hover:bg-gray-50 text-gray-800'
                            }`}
                          >
                            <p className="font-medium">{type.name}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-full text-center">No available property types.</p>
                      )}
                    </div>
                  </div>

                  {/* Subcategories */}
                  <div className="p-5 border rounded-xl bg-white shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Subcategories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedType ? (
                        selectedType.subTypes.length > 0 ? (
                          selectedType.subTypes.map((subType, index) => (
                            <div
                              key={index}
                              onClick={() => setData('property_sub_type', subType)}
                              className={`p-3 border rounded-lg text-center cursor-pointer transition-all ${
                                data.property_sub_type === subType
                                  ? 'bg-green-500 text-white border-green-500'
                                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {subType}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 col-span-full text-center">No subcategories available for this type.</p>
                        )
                      ) : (
                        <p className="text-gray-500 col-span-full text-center">Please select a property type to see subcategories.</p>
                      )}
                    </div>
                  </div>


                </div>
              </Collapsable>


              <Collapsable title="Pricing" description="haha">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Price Input */}
                  <div className="flex flex-col">
                    <InputLabel htmlFor="price" value="Price" />
                    <input
                      id="price"
                      type="number"
                      value={data.price}
                      onChange={(e) => setData('price', e.target.value)}
                      placeholder="e.g. 1000000.00"
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Address Input */}
                  <div className="flex flex-col">
                    <InputLabel htmlFor="address" value="Address" />
                    <TextInput
                      id="address"
                      type="text"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Magahis tres, Tuy Batangas"
                      autoComplete="address"
                    />
                  </div>
                </div>
              </Collapsable>
              <Collapsable title="Property Details" isOpen={true}>
                {/* Lot Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Lot Area (sqm)', key: 'lot_area' },
                    { label: 'Floor Area (sqm)', key: 'floor_area' },
                    { label: 'Car Slots', key: 'car_slots' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <InputLabel htmlFor={key} value={label} />
                      <input
                        id={key}
                        type="number"
                        value={data[key]}
                        onChange={(e) => setData(key, e.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none px-3 py-2"
                      />
                    </div>
                  ))}
                </div>

                {/* Room Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Total Rooms', key: 'total_rooms' },
                    { label: 'Bedrooms', key: 'total_bedrooms' },
                    { label: 'Bathrooms', key: 'total_bathrooms' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <InputLabel htmlFor={key} value={label} />
                      <input
                        id={key}
                        type="number"
                        value={data[key]}
                        onChange={(e) => setData(key, e.target.value)}
                        className="mt-2 w-full rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none px-3 py-2"
                      />
                    </div>
                  ))}
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                  <InputLabel htmlFor="image_upload" className="block text-sm font-medium text-gray-700">
                    Property Images
                  </InputLabel>
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
                      <p className="mb-2 text-lg font-semibold text-gray-700">Drag & Drop Files Here</p>
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
                  <InputError message={errors.image_urls} className="mt-2" />
                </div>

                {/* Feature Tags */}
                <div>
                  <InputLabel htmlFor="feature_input" value="Features" />
                  <input
                    id="feature_input"
                    type="text"
                    placeholder="Add feature and press Enter"
                    className="mt-2 border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && featureInput.trim() !== '') {
                        setData('feature_name', [...data.feature_name, featureInput.trim()]);
                        setFeatureInput('');
                        e.preventDefault();
                      }
                    }}
                  />

                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.feature_name.map((feature, index) => (
                      <div
                        key={index}
                        className="relative inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.feature_name.filter((_, i) => i !== index);
                            setData('feature_name', updated);
                          }}
                          className="absolute -top-1 -right-1 text-xs text-red-500 bg-transparent w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <InputError message={errors.feature_name} className="mt-2" />
                </div>
              </Collapsable>

              <Collapsable title='Key Information'description='Detailed desctiption about ptoperty.'>
                <div className="">
                  <h1 className="text-2xl font-bold mb-4">Draw Property Location</h1>
                  <MapWithDraw userId={auth.user.id}  onChange={handleMapChange} />
                  <InputError message={errors.boundary} className="mt-2" />
                  <InputError message={errors.pin} className="mt-2" />
                </div>               
              </Collapsable>
              
            </section>
            <div className="px-4 py-3 md:py-4 lg:py-5 sm:px-7 lg:px-6">
                <button
                  type="submit"
                  className="bg-green-600 text-white w-full sm:w-auto px-6 py-2 rounded hover:bg-green-700 transition"
                  disabled={processing}
                >
                  { processing ? "Submiting" : "Submit"}
                </button>
            </div>

            

             
          </div>
        </form>
      </div>
    </div>
  );

};

export default ListProperty;
