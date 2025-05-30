import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
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
    image_url: [], // This will hold File objects
  });

  const [isOpen, setIsOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  const closeModal = () => setIsOpen(false);

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

  // Step validation
  const isFilled = {
    keyInfo: !!data.title && !!data.description,
    location: !!data.address,
    sizeLayout:
      !!data.lot_area &&
      !!data.floor_area &&
      !!data.car_slots &&
      !!data.total_rooms &&
      !!data.total_bedrooms &&
      !!data.total_bathrooms,
    price: !!data.price,
    features: data.feature_name.length > 0 || data.image_url.length > 0,
  };

  const steps = [
    { label: 'Key Information', filled: isFilled.keyInfo },
    { label: 'Location', filled: isFilled.location },
    { label: 'Size & Layout', filled: isFilled.sizeLayout },
    { label: 'Price', filled: isFilled.price },
    { label: 'Features & Images', filled: isFilled.features },
  ];

  return (
    <div className="pt-20 bg-gray-50 px-4 min-h-screen">
      <NavBar />

      <Modal show={isOpen} onClose={closeModal} maxWidth="2xl" closeable={false}>
        <div className="mx-auto max-w-xl">
          <ListingRequirements closeModal={closeModal} />
        </div>
      </Modal>

      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sidebar Progress */}
            <div className="hidden lg:block">
              <div className="bg-white border rounded-xl p-6 space-y-4 sticky top-24">
                <h2 className="text-lg font-semibold mb-2">Form Progress</h2>
                {steps.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-700"
                  >
                    <span>{item.label}</span>
                    {item.filled ? (
                      <CheckCircle className="text-green-500" size={18} />
                    ) : (
                      <CirclePlus className="text-gray-300" size={18} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Form */}
            <section className="col-span-2 space-y-6 bg-white p-4 md:p-6 rounded-2xl border">
              {/* Title */}
              <div>
                <InputLabel htmlFor="title" value="Title" />
                <TextInput
                  id="title"
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
                <InputLabel htmlFor="description" value="Description" />
                <Editor
                  value={data.description}
                  onChange={handleDescriptionChange}
                  className="h-60"
                />
                <InputError message={errors.description} className="mt-2" />
              </div>

              {/* Property Type/Subtype */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

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
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    className="mt-2 w-full"
                    placeholder="Magahis tres, Tuy Batangas"
                  />
                </div>
              </div>

              {/* Size & Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Lot Area (sqm)', key: 'lot_area' },
                  { label: 'Floor Area (sqm)', key: 'floor_area' },
                  { label: 'Car Slots', key: 'car_slots' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <InputLabel value={label} />
                    <input
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
                    <InputLabel value={label} />
                    <input
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
                <InputLabel htmlFor="image_upload" value="Upload Property Images" />

                <div className="flex items-center justify-center w-full mt-2">
                  <label
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
                  </label>
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
