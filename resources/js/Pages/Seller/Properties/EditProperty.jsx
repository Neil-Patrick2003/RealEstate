import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useEffect } from 'react';
import InputWithLabel from '@/Components/InputWithLabel';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import Editor from 'react-simple-wysiwyg';
import Toggle from '@/Components/Toggle';

const property_type = [
  { name: "Apartment", subTypes: ["Penthouse", "Loft", "Bedspace", "Room"] },
  { name: "Commercial", subTypes: ["Retail", "Offices", "Building", "Warehouse", "Serviced Office", "Coworking Space"] },
  { name: "Condominium", subTypes: ["Loft", "Studio", "Penthouse", "Other", "Condotel"] },
  { name: "House", subTypes: ["Townhouse", "Beach House", "Single Family House", "Villas"] },
  { name: "Land", subTypes: ["Beach Lot", "Memorial Lot", "Agricultural Lot", "Commercial Lot", "Residential Lot", "Parking Lot"] }
];

const EditProperty = ({ property }) => {
  const { data, setData, processing, post, errors } = useForm({
    title: property.title || '',
    description: property.description || '',
    property_type: property.property_type || '',
    property_sub_type: property.property_sub_type || '',
    price: property.price || '',
    address: property.address || '',
    lot_area: property.lot_area || '',
    floor_area: property.floor_area || '',
    total_rooms: property.total_rooms || '',
    total_bedrooms: property.total_bedrooms || '',
    total_bathrooms: property.total_bathrooms || '',
    car_slots: property.car_slots || '',
    isPresell: property.isPresell ?? false,
    image_url: property.image_url || '',
    feature_name: property.feature_name || [],
    image_urls: property.image_urls || [],
    boundary: property.boundary || null,
    pin: property.pin || null,
    image_preview: property.image_preview || ''
  });

  const [selectedType, setSelectedType] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (typeof data.image_url === 'string' && data.image_url !== '') {
      setPreview(data.image_url.startsWith('http') ? data.image_url : `/storage/${data.image_url}`);
    } else if (property.image_preview) {
      setPreview(property.image_preview);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/your-endpoint'); // Adjust this line to your actual endpoint
  };

  const handleTypeClick = (typeName) => {
    const selected = property_type.find(type => type.name === typeName);
    setSelectedType(selected);
    setData('property_type', typeName);
    setData('property_sub_type', '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
      setData('image_url', file);
    }
  };

  return (
    <AuthenticatedLayout>
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto space-y-10 p-8 bg-white rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-gray-800">Edit: {property.title}</h1>

        {/* Image Upload */}
        <div className="flex flex-col items-center">
          <label
            htmlFor="property_image"
            className={`mt-2 flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed rounded-xl transition ${
              preview ? 'border-transparent' : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
            }`}
          >
            {preview ? (
              <div className="flex flex-col items-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-80 w-full object-cover shadow-md"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('property_image').click()}
                  className="mt-2 px-4 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6">
                <div className="mb-4 bg-gray-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 00-8 0v1H5a2 2 0 000 4h14a2 2 0 000-4h-3V8z" />
                  </svg>
                </div>
                <p className="mb-2 text-lg font-semibold text-gray-700">Drag & Drop or Click to Upload</p>
                <p className="text-sm text-gray-500 text-center">PNG, JPG, WebP</p>
              </div>
            )}
          </label>

          <input
            type="file"
            id="property_image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-xl shadow-sm bg-gray-50">
          <span className="text-gray-700 font-medium">Allow Pre-Selling</span>
          <Toggle data={data} setData={setData} />
        </div>

        {/* Title */}
        <div>
          <InputWithLabel
            id="title"
            name="title"
            label="Property Title"
            type="text"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            isFocused={true}
          />
          <InputError message={errors.title} className="mt-2" />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Editor
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            className="w-full min-h-[250px] p-4 text-sm text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none"
            placeholder="Enter property description here..."
          />
          <textarea
            id="description"
            name="description"
            value={data.description}
            onChange={() => {}}
            className="sr-only"
            readOnly
            aria-hidden="true"
          />
          <InputError message={errors.description} className="mt-2" />
        </div>

        {/* Property Type */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">Property Type</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {property_type.map((type) => (
              <div
                key={type.name}
                onClick={() => handleTypeClick(type.name)}
                className={`py-3 border rounded-lg text-center cursor-pointer transition-all ${
                  selectedType?.name === type.name
                    ? 'bg-green-100 text-green-800 border-green-400'
                    : 'bg-white hover:bg-gray-100 text-gray-600'
                }`}
              >
                <p className="font-medium">{type.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        <div>
          <p className="font-semibold text-gray-700 mb-2">Subcategory</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedType ? (
              selectedType.subTypes.length > 0 ? (
                selectedType.subTypes.map((subType, index) => (
                  <div
                    key={index}
                    onClick={() => setData('property_sub_type', subType)}
                    className={`py-3 border rounded-lg text-center cursor-pointer transition-all ${
                      data.property_sub_type === subType
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {subType}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center">
                  No subcategories available.
                </p>
              )
            ) : (
              <p className="text-gray-500 col-span-full text-center">
                Select a property type first.
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={processing}
            className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-md shadow hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {processing ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
};

export default EditProperty;
