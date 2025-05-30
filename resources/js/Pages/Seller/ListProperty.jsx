import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import NavBar from '@/Components/NavBar';
import ListingRequirements from '@/Components/Stepper/ListingRequirements';
import { useForm } from '@inertiajs/react';
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel as MuiInputLabel,
  FormHelperText,
} from '@mui/material';
import { CirclePlus } from 'lucide-react';
import React, { useState } from 'react';
import Editor from 'react-simple-wysiwyg';

const ListProperty = () => {
  const { data, setData, processing, post, errors, reset } = useForm({
    name: '',
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
  });

  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const onDescriptionChange = (e) => {
    setData('description', e.target.value);
  };

  return (
    <div className="pt-20">
      <NavBar />
      <Modal show={isOpen} onClose={closeModal} maxWidth="2xl" closeable={false}>
        <div className="mx-auto max-w-xl">
          <ListingRequirements closeModal={closeModal} />
        </div>
      </Modal>

      <form>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="hidden lg:block border space-y-4">
            <div className="flex-center-between">
              <span>Key Information</span>
              <CirclePlus />
            </div>
            <div className="flex-center-between">
              <span>Location</span>
              <CirclePlus />
            </div>
            <div className="flex-center-between">
              <span>Size and Layout</span>
              <CirclePlus />
            </div>
            <div className="flex-center-between">
              <span>Price</span>
              <CirclePlus />
            </div>
            <div className="flex-center-between">
              <span>Features and Images</span>
              <CirclePlus />
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            {/* Name */}
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              size="small"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />

            {/* Description */}
            <div>
              <InputLabel htmlFor="description" value="Description" />
              <Editor
                value={data.description}
                onChange={onDescriptionChange}
                className="h-60 border p-2 rounded"
              />
              {errors.description && (
                <p className="text-red-600 mt-1 text-sm">{errors.description}</p>
              )}
            </div>

            {/* Property Type */}
            <FormControl fullWidth size="small" error={!!errors.property_type}>
              <MuiInputLabel id="property-type-label">Property Type</MuiInputLabel>
              <Select
                labelId="property-type-label"
                value={data.property_type}
                label="Property Type"
                onChange={(e) => setData('property_type', e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="land">Land</MenuItem>
                <MenuItem value="house">House</MenuItem>
                <MenuItem value="condo">Condo</MenuItem>
                {/* Add more types as needed */}
              </Select>
              <FormHelperText>{errors.property_type}</FormHelperText>
            </FormControl>

            {/* Property Subtype */}
            <FormControl fullWidth size="small" error={!!errors.property_sub_type}>
              <MuiInputLabel id="property-subtype-label">Property Subtype</MuiInputLabel>
              <Select
                labelId="property-subtype-label"
                value={data.property_sub_type}
                label="Property Subtype"
                onChange={(e) => setData('property_sub_type', e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                {/* Add more subtypes as needed */}
              </Select>
              <FormHelperText>{errors.property_sub_type}</FormHelperText>
            </FormControl>

            {/* Price */}
            <TextField
              fullWidth
              label="Price"
              variant="outlined"
              size="small"
              type="number"
              value={data.price}
              onChange={(e) => setData('price', e.target.value)}
              error={!!errors.price}
              helperText={errors.price}
            />

            {/* Address */}
            <TextField
              fullWidth
              label="Address"
              variant="outlined"
              size="small"
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              error={!!errors.address}
              helperText={errors.address}
            />

            {/* Lot Area */}
            <TextField
              fullWidth
              label="Lot Area (sq ft)"
              variant="outlined"
              size="small"
              type="number"
              value={data.lot_area}
              onChange={(e) => setData('lot_area', e.target.value)}
              error={!!errors.lot_area}
              helperText={errors.lot_area}
            />

            {/* Floor Area */}
            <TextField
              fullWidth
              label="Floor Area (sq ft)"
              variant="outlined"
              size="small"
              type="number"
              value={data.floor_area}
              onChange={(e) => setData('floor_area', e.target.value)}
              error={!!errors.floor_area}
              helperText={errors.floor_area}
            />

            {/* Total Rooms */}
            <TextField
              fullWidth
              label="Total Rooms"
              variant="outlined"
              size="small"
              type="number"
              value={data.total_rooms}
              onChange={(e) => setData('total_rooms', e.target.value)}
              error={!!errors.total_rooms}
              helperText={errors.total_rooms}
            />

            {/* Total Bedrooms */}
            <TextField
              fullWidth
              label="Total Bedrooms"
              variant="outlined"
              size="small"
              type="number"
              value={data.total_bedrooms}
              onChange={(e) => setData('total_bedrooms', e.target.value)}
              error={!!errors.total_bedrooms}
              helperText={errors.total_bedrooms}
            />

            {/* Total Bathrooms */}
            <TextField
              fullWidth
              label="Total Bathrooms"
              variant="outlined"
              size="small"
              type="number"
              value={data.total_bathrooms}
              onChange={(e) => setData('total_bathrooms', e.target.value)}
              error={!!errors.total_bathrooms}
              helperText={errors.total_bathrooms}
            />

            {/* Car Slots */}
            <TextField
              fullWidth
              label="Car Slots"
              variant="outlined"
              size="small"
              type="number"
              value={data.car_slots}
              onChange={(e) => setData('car_slots', e.target.value)}
              error={!!errors.car_slots}
              helperText={errors.car_slots}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ListProperty;
