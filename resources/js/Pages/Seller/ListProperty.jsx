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
  const { data, setData, processing, post, errors } = useForm({
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
    feature_name: [],
    image_url: [],
    boundary: null,
    pin: null,
  });

  

  const [imagePreviews, setImagePreviews] = useState([]);

  const [featureInput, setFeatureInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/post-property', data, {
      forceFormData: true,  // <-- important for file uploads
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
    setData('image_url', [...data.image_url, ...files]);
  };

  // Removes selected image preview + file
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setData('image_url', data.image_url.filter((_, i) => i !== index));
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

    const [enabled, setEnabled] = useState(false)

  

  return (
    <div className=" pt-20 bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="">
            {/* Main Form */}
            <section className="space-y-6 bg-white p-4 md:p-6 rounded-2xl">
              {/* Title */}
              <div>
                is pre sell
                <Toggle data={data} setData={setData}/>
              </div>
              <div>
                <InputLabel htmlFor="title" value="Title" />
                <TextInput
                  id="title"
                  name="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  className="mt-2 block w-full"
                  placeholder="e.g. Affordable Lot for Sale in Batangas"
                  required
                />
                <InputError message={errors.title} className="mt-2" />
              </div>

              {/* Description */}
              <div>
                {/* <InputLabel htmlFor="description" value="Description" /> */}
                
                <Editor
                  id='select'
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="h-60"
                />
                <InputError message={errors.description} className="mt-2" />
              </div>

              {/* Property Type/Subtype */}
              <div className="space-y-4">
                <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {property_type.length > 0 ? (
                        property_type.map((type) => (
                        <div
                            key={type.name}
                            className={`p-4 border rounded-lg text-center cursor-pointer transition ${
                            selectedType?.name === type.name ? 'border-green-500 bg-green-500 text-white' : ''
                            }`}
                            onClick={() => handleTypeClick(type.name)}
                        >
                            <p className="font-medium">{type.name}</p>
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
                            onClick={() => {
                              setData('property_sub_type', subType);
                              console.log(subType);
                            }}
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
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel htmlFor="property_type" value="Property Type" />
                  <select
                    id="property_type"
                    value={data.property_type}
                    onChange={(e) => setData('property_type', e.target.value)}
                    className="mt-2 w-full rounded-md border-gray-200 shadow-sm ring-1 focus:ring-2 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="land">Land</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                  </select>
                </div>
                <div>
                  <InputLabel htmlFor="property_sub_type" value="Property Subtype" />
                  <select
                    id="property_sub_type"
                    value={data.property_sub_type}
                    onChange={(e) => setData('property_sub_type', e.target.value)}
                    className="mt-2 w-full rounded-md border-gray-200 shadow-sm ring-1 focus:ring-2 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select Subtype</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div> */}

              {/* Price & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel htmlFor="price" value="Price" />
                  <input
                    id="price"
                    type="number"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    placeholder="1000000.00"
                    className="mt-2 w-full rounded-md border-gray-200 shadow-sm ring-1 focus:ring-2 focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <InputLabel htmlFor="address" value="Address" />
                  <TextInput
                    id="address"
                    type="text"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    className="mt-2 w-full"
                    placeholder="Magahis tres, Tuy Batangas"
                    autoComplete="address"
                  />
                </div>
              </div>

            <Collapsable title="About Us">
              <p>This is the collapsible content. You can add paragraphs, lists, images, etc.</p>
            </Collapsable>


              {/* Size & Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                      className="mt-2 w-full rounded-md border-gray-200 shadow-sm ring-1 focus:ring-2 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Rooms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                      className="mt-2 w-full rounded-md border-gray-200 shadow-sm ring-1 focus:ring-2 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Upload Images */}
              <div>
                <div className="flex items-center justify-center w-full mt-2">
                  <InputLabel
                    htmlFor="image_upload"
                    className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
                      <div className="mb-4 bg-gray-100 rounded-full p-3">
                        <svg
                          className="w-6 h-6 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 0 0-8 0v1H5a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4h-3V8z"
                          />
                        </svg>
                      </div>
                      <p className="mb-2 text-lg font-semibold text-gray-700">
                        Drag & Drop Files Here
                      </p>
                      <p className="mb-2 text-sm text-gray-500 text-center">
                        Drag and drop PNG, JPG, WebP, SVG images<br /> or click to browse
                      </p>
                      <span className="text-blue-600 text-sm font-medium underline">
                        Browse File
                      </span>
                    </div>
                    <input
                      id="image_upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </InputLabel>
                </div>

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
                <InputError message={errors.image_url} className="mt-2" />
              </div>

              {/* Feature Tags */}
              <div>
                <InputLabel htmlFor="feature_input" value="Features" />
                <div className="flex gap-2 mt-2">
                  <input
                    id='feature_input'
                    type="text"
                    placeholder="Add feature"
                    className="border rounded px-3 py-1 w-full"
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
                </div>

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
                        className="absolute -top-1 -right-1 text-sm leading-none text-red-500 bg-transparent rounded-full w-4 h-4 flex items-center justify-center shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <InputError message={errors.feature_name} className="mt-2" />
              </div>

               <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Draw Property Location</h1>
                  <MapWithDraw userId={auth.user.id}  onChange={handleMapChange} />
                </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white w-full sm:w-auto px-6 py-2 rounded hover:bg-green-700 transition"
                  disabled={processing}
                >
                  Submit Property
                </button>
              </div>
            </section>

             
          </div>
        </form>
      </div>
    </div>
  );

};

export default ListProperty;
