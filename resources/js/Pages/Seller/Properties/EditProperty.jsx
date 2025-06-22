import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useEffect } from 'react';
import InputWithLabel from '@/Components/InputWithLabel';
import InputError from '@/Components/InputError';
import {  router, useForm } from '@inertiajs/react';

import Editor from 'react-simple-wysiwyg';
import Toggle from '@/Components/Toggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faXmark, faCloudArrowUp, faCheck } from '@fortawesome/free-solid-svg-icons';
import { SplinePointer, Trash2 } from 'lucide-react';
import DeleteExistingImage from '@/Components/modal/ConfirmDialog';
import ConfirmDialog from '@/Components/modal/ConfirmDialog';
import Breadcrumb from '@/Components/Breadcrumbs';


const property_type = [
  { name: "Apartment", subTypes: ["Penthouse", "Loft", "Bedspace", "Room"] },
  { name: "Commercial", subTypes: ["Retail", "Offices", "Building", "Warehouse", "Serviced Office", "Coworking Space"] },
  { name: "Condominium", subTypes: ["Loft", "Studio", "Penthouse", "Other", "Condotel"] },
  { name: "House", subTypes: ["Townhouse", "Beach House", "Single Family House", "Villas"] },
  { name: "Land", subTypes: ["Beach Lot", "Memorial Lot", "Agricultural Lot", "Commercial Lot", "Residential Lot", "Parking Lot"] }
];

const EditProperty = ({ property }) => {
  // ======================== Form Setup ========================
  const { data, setData, processing, patch, post, errors, reset } = useForm({
    title: property.title || '',
    description: property.description || '',
    property_type: property.property_type || '',
    property_sub_type: property.sub_type || '',
    price: property.price || '',
    address: property.address || '',
    lot_area: property.lot_area || '',
    floor_area: property.floor_area || '',
    total_rooms: property.total_rooms || '',
    total_bedrooms: property.bedrooms || '',
    total_bathrooms: property.bathrooms || '',
    car_slots: property.car_slots || '',
    isPresell: property.isPresell ?? false,
    image_url: property.image_url || '',
    feature_name: property.feature_name || [],
    boundary: property.boundary || null,
    pin: property.pin || null,
  });

  const {
    data: imageForm,
    setData: setImageData,
    post: postImages,
    processing: imageProcessing,
    reset: resetImageForm,
    errors: imageErrors,
  } = useForm({
    image_urls: [],
  });





  // ======================== State ========================
  const [selectedType, setSelectedType] = useState(null);
  const [preview, setPreview] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // ======================== Effects ========================
  useEffect(() => {
    // Set preview image
    if (typeof data.image_url === 'string' && data.image_url !== '') {
      const formattedUrl = data.image_url.startsWith('http') ? data.image_url : `/storage/${data.image_url}`;
      setPreview(formattedUrl);
    } else if (property.image_preview) {
      setPreview(property.image_preview);
    }

    // Set selected type
    if (data.property_type) {
      const foundType = property_type.find(type => type.name === data.property_type);
      setSelectedType(foundType || null);
    }

    // Set sub type
    if (data.sub_type) {
      setData('property_sub_type', data.sub_type);
    }

    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  // ======================== Handlers ========================

  // Submit main form
  const handleSubmit = (e) => {
    e.preventDefault();
    patch(`/properties/${property.id}/edit`);
  };

  // Set property type
  const handleTypeClick = (typeName) => {
    const selected = property_type.find(type => type.name === typeName);
    setSelectedType(selected);
    setData('property_type', typeName);
    setData('property_sub_type', '');
  };

  // Main preview image change
  const handleImagePropertyChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
      setData('image_url', file);
    }
  };

  // Additional images preview

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('image_urls[]', file); // ✅ correct field name
    });

    router.post(`/properties/${property.id}/upload-image`, formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        console.log('✅ Images uploaded');
      },
      onError: (err) => {
        console.error('❌ Upload failed', err);
      },
    });
  };




  // // Upload additional images
  const handleAddImage = (e) => {
    e.preventDefault();

    if (!imageForm.image_urls.length) {
      console.error('No images to upload');
      return;
    }

    postImages(`/properties/${property.id}/edit-images`, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        console.log('Images uploaded');
        resetImageForm();           // reset form state
      },
      onError: (errors) => {
        console.error('Upload failed:', errors);
      },
    });
  };


  

  // Remove image preview before upload
  const handleRemoveImage = (index) => {
    setData('image_urls', data.image_urls.filter((_, i) => i !== index));
  };

  // Open dialog for deleting existing image
  const openDeleteDialog = (id) => {
    setSelectedImageId(id);
    setDialogOpen(true);
  };

  // Confirm delete existing image
  const handleDelete = () => {
    if (!selectedImageId) return;

    router.delete(`/properties/${property.id}/edit/${selectedImageId}`, {
      onSuccess: () => {
        setSelectedImageId(null);
      },
    });
  };


  // breadcrumbPages
  const breadcrumbPages = [
    { name: 'Properties', href: '/properties', current: false },
    { name: `${property.title}`, href: `/properties/${property.id}/edit`, current: true },

  ];





  return (
    <AuthenticatedLayout>
      <Breadcrumb pages={breadcrumbPages} />
      
      
      <div className="max-w-5xl mx-auto mb-6 mt-6 px-4 md:px-0">
        <div className='flex-center-between'>
          <h1 className="flex flex-col text-2xl md:text-3xl font-bold text-primary">
            Update Your Property Listing
            <span className="mt-1 text-sm md:font-medium text-gray-400 leading-relaxed">
              Keep your property details up-to-date. You can change the title, location, pricing, features, and upload new images.
            </span>
          </h1>
          <button
            type="submit"
            form="property_dertail_form"
            className="px-4 py-2 bg-primary hover:bg-accent text-white rounded-md shadow-sm transition duration-200 flex items-center gap-2"
            disabled={processing}
          >
            <FontAwesomeIcon icon={faCheck} />
            
            {processing ? 'Saving...' : 'Save Changes'  }
          </button> 
        
        </div>

        
      </div>
      <form
        id='property_dertail_form'
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto bg-white rounded-xl shadow"
      >
        {/* Image Upload */}
        <div className="flex flex-col items-center border rounded-t-xl overflow-hidden shadow-sm h-80 w-full">
          <label
            htmlFor="property_image"
            className={`relative w-full h-full flex items-center justify-center border-2 border-dashed transition rounded-t-xl ${
              preview
                ? 'border-none bg-gray-100'
                : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
            }`}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('property_image').click()}
                  className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-1 text-sm text-white bg-secondary hover:bg-orange-400 rounded shadow"
                >
                  Edit
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 pt-5 pb-6 text-center">
                <div className="mb-4 bg-gray-100 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-text"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0-6l-3 3m3-3l3 3M16 8a4 4 0 00-8 0v1H5a2 2 0 000 4h14a2 2 0 000-4h-3V8z"
                    />
                  </svg>
                </div>
                <p className="mb-1 text-lg font-semibold text-text">Drag & Drop or Click to Upload</p>
                <p className="text-sm text-text">Accepted formats: PNG, JPG, WebP</p>
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

        <div className='mt-4 md:mx-auto space-y-10 p-6 md:p-8 '>
          {/* Toggle */}
          <div className="flex items-center justify-between px-4  py-2 border rounded-md bg-gray-50">
            <span className="text-text font-xs">Allow Pre-Selling</span>
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
            <label htmlFor="description" className="block text-sm font-medium text-text mb-1">
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
          <div className="mb-6">
            <p className="font-semibold text-sm text-gray-800 mb-2">Select Property Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {property_type.map((type) => (
                <div
                  key={type.name}
                  onClick={() => handleTypeClick(type.name)}
                  className={`py-3 px-4 border text-center rounded-lg cursor-pointer shadow-sm transition-all duration-200 
                  ${selectedType?.name === type.name 
                    ? 'bg-accent text-white ' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                >
                  <p className="font-medium text-sm">{type.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategories */}
          <div className="mb-6">
            <p className="font-semibold text-sm text-gray-800 mb-2">Choose Subcategory</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedType ? (
                selectedType.subTypes.length > 0 ? (
                  selectedType.subTypes.map((subType, index) => (
                    <div
                      key={index}
                      onClick={() => setData('property_sub_type', subType)}
                      className={`py-2 px-4 border text-center rounded-lg cursor-pointer shadow-sm transition-all duration-200 
                      ${data.property_sub_type === subType
                        ? 'bg-accent text-white border-green-600'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}`}
                    >
                      {subType}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full text-center">No subcategories available.</p>
                )
              ) : (
                <p className="text-gray-500 col-span-full text-center">Select a property type first.</p>
              )}
            </div>
          </div>


          <div className='border-b'>
            
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4'>
            {/* Price */}
            <div>
              <InputWithLabel
                id="price"
                name="price"
                label="Price"
                type="number"
                value={data.price}    
                onChange={(e) => setData('price', e.target.value)}
                placeholder="Enter price"
              />
              <InputError message={errors.price} className="mt-2" />
            </div>


            {/* Price */}
            <div>
              <InputWithLabel
                id="location"
                name="location"
                label="Location"
                type="text"
                value={data.address}    
                onChange={(e) => setData('address', e.target.value)}
              />
              <InputError message={errors.lcoation} className="mt-2" />
            </div>

            {/* Lot area */}
            <div>
              <InputWithLabel
                id="lot_area"
                name="Lot Area"
                label="Lot Area (sqm)"
                type="number"
                value={data.lot_area}    
                onChange={(e) => setData('lot_area', e.target.value)}
              />
              <InputError message={errors.lot_area} className="mt-2" />
            </div>

            {/* foor area */}
            <div>
              <InputWithLabel
                id="floor_area"
                name="Floor Area"
                label="Floor Area (sqm)"
                type="number"
                value={data.floor_area}    
                onChange={(e) => setData('floor_area', e.target.value)}
              />
              <InputError message={errors.floor_area} className="mt-2" />
            </div>

            {/* rooms */}
            <div>
              <InputWithLabel
                id="total_rooms"
                name="total_rooms"
                label="Number of Rooms"
                type="number"
                value={data.total_rooms}    
                onChange={(e) => setData('total_rooms', e.target.value)}
              />
              <InputError message={errors.total_rooms} className="mt-2" />
            </div>

            {/* bedrooms */}
            <div>
              <InputWithLabel
                id="total_bedrooms"
                name="total_bedrooms"
                label="Number of Bedrooms"
                type="number"
                value={data.total_bedrooms}    
                onChange={(e) => setData('total_bedrooms', e.target.value)}
              />
              <InputError message={errors.total_bedrooms} className="mt-2" />
            </div>

            {/* bathrooms */}
            <div>
              <InputWithLabel
                id="total_bathrooms"
                name="total_bathrooms"
                label="Number of Bathrooms"
                type="number"
                value={data.total_bathrooms}    
                onChange={(e) => setData('total_bathrooms', e.target.value)}
              />
              <InputError message={errors.total_bathrooms} className="mt-2" />
            </div>

            {/* parking slots */}
            <div>
              <InputWithLabel
                id="car_slots"
                name="car_slots"
                label="Number of Car Slots"
                type="number"
                value={data.car_slots}    
                onChange={(e) => setData('car_slots', e.target.value)}
              />
              <InputError message={errors.total_bathrooms} className="mt-2" />
            </div>
          </div>
        </div>
      </form>


      {/* Property Images Section */}
      <div className='mt-6 p-2 max-w-5xl mx-auto'>
          <div className="flex flex-col mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Property Images
                <span className="block text-sm text-gray-400 mt-1">
                  Upload additional images for your property.
                </span>
              </h2>

              <label
                htmlFor="image_upload"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-secondary hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer transition duration-200 shadow-sm text-sm md:text-base"
              >
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-white text-base md:text-lg" />
                                    <span className="hidden md:inline">Upload Additional Images</span>

                <input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange} // ✅ only update previews and set files
                  className="hidden"
                />
              </label>
            </div>

            <InputError message={imageErrors.image_urls} className="text-red-500 text-sm mb-4" />

            {/* Previews from DB */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1.5 gap-y-1.5 md:gap-6 mb-4">
              {property.images?.length === 0 && (
                <p className="col-span-full text-center text-gray-500">No images uploaded yet.</p>
              )}

              {property.images.map((image, index) => (
                <div key={index} className="relative h-40 rounded-lg overflow-hidden">
                  <img
                    src={image.image_url.startsWith('http') ? image.image_url : `/storage/${image.image_url}`}
                    alt={`Property Image ${index + 1}`}
                    className="w-full h-full border object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(image.id)}
                    className="absolute top-1 right-1 bg-white text-text rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
      </div>
      <ConfirmDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        title="Delete Image"
        description="Are you sure you want to delete this image?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        loading={false}
      />
    </AuthenticatedLayout>
  );
};

export default EditProperty;
