import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faExpand,
  faTags,
  faCircleCheck,
  faHourglassHalf,
  faCircleXmark,
  faBuilding,
  faHouseChimney,
  faTruckRampBox,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';
import PropertyMap from '@/Components/PropertyMap';
import ImageModal from '@/Components/Modal/ImageModal';

const ShowProperty = ({ property }) => {

  console.log(property);
  const imageBasePath = '/storage/';
  const [visibleImages, setVisibleImages] = useState([]);
  const [openImage, setOpenImage] = useState(false);
  const imageRef = useRef(property.images);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setVisibleImages(isDesktop ? property.images.slice(0, 2) : property.images);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [property.images]);

  return (
    <AuthenticatedLayout>
      {/* Back Link */}
      <div className="px-4 py-4">
        <Link href="/properties" className="text-sm text-[#5C7934] hover:text-[#719440]">&larr; Back</Link>
      </div>

      {/* GALLERY SECTION */}
      <div className="px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-1 md:col-span-2"
        >
          <img
            src={`${imageBasePath}${property.image_url}`}
            alt={property.title}
            className="w-full h-[50vh] md:h-[60vh] object-cover rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          />
        </motion.div>

        {/* Side Gallery */}
        <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
          {visibleImages.map((image, index) => {
            const isLast = index === visibleImages.length - 1;
            const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
            const moreCount = property.images.length - visibleImages.length;

            return (
              <div
                key={image.id}
                className="relative w-36 h-28 md:h-[30vh] md:w-full rounded-xl overflow-hidden border hover:shadow cursor-pointer group"
                onClick={() => isLast && isDesktop && property.images.length > 2 && setOpenImage(true)}
              >
                <img
                  src={`${imageBasePath}${image.image_url}`}
                  alt={`Gallery ${image.id}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {isLast && isDesktop && property.images.length > 2 && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-semibold text-sm md:text-base backdrop-blur-sm group-hover:bg-opacity-50">
                    +{moreCount} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TITLE & DETAILS */}
      <div className="px-4 mt-6 mx-4 space-y-3">
        <h1 className="text-3xl md:text-5xl font-bold font-serif text-[#5C7934]">
          {property.title}
        </h1>

        <h2 className="text-[#719440] font-medium text-base md:text-xl flex items-center gap-1">
          <FontAwesomeIcon icon={faBuilding} className="text-md md:text-lg" />
          {property.property_type} &bull; {property.sub_type}
        </h2>

        <p className="text-sm md:text-base text-gray-400">Listed on {property.created_at}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 text-[#5C7934] text-base md:text-lg">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="h-5 w-5 md:h-6 md:w-6" />
            <span className="">{property.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faExpand} className="h-5 w-5 md:h-6 md:w-6" />
            <span>{property.lot_area} sqm</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTags} className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-green-700 font-semibold">₱ {property.price}</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={
                property.status === 'Approved'
                  ? faCircleCheck
                  : property.status === 'Pending'
                  ? faHourglassHalf
                  : faCircleXmark
              }
              className={`h-5 w-5 md:h-6 md:w-6 ${
                property.status === 'Approved'
                  ? 'text-green-500'
                  : property.status === 'Pending'
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }`}
            />
            <span>Status: {property.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTruckRampBox} className="h-5 w-5 md:h-6 md:w-6" />
            <span>{property.isPresell ? 'Pre-Selling' : 'Ready for Occupancy'}</span>
          </div>
        </div>
      </div>


      {/* DESCRIPTION & SPECS */}
      <div className="mt-8 mx-4 md:mx-8 bg-white rounded-xl shadow p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-[#5C7934] mb-2">Description</h2>
          <div
            className="text-gray-700 leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: property.description || '<p>No description available.</p>' }}
          />
        </div>

        {/* Specs */}
        <div>
          <h2 className="text-lg font-semibold text-[#5C7934] mb-2">Specifications</h2>
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-50 text-[#5C7934]">
              <tr>
                <th className="border p-2">Category</th>
                <th className="border p-2">Number</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-2">Total Rooms</td><td className="border p-2">{property.total_rooms}</td></tr>
              <tr><td className="border p-2">Bedrooms</td><td className="border p-2">{property.bedrooms}</td></tr>
              <tr><td className="border p-2">Bathrooms</td><td className="border p-2">{property.bathrooms}</td></tr>
              <tr><td className="border p-2">Car Slots</td><td className="border p-2">{property.car_slots}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-lg font-semibold text-[#5C7934] mb-2">Features</h2>
          {property.features.length ? (
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature) => (
                <span key={feature.id} className="px-4 py-1 border border-[#5C7934] text-[#5C7934] rounded-full text-sm">
                  {feature.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No features listed.</p>
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="px-4 md:px-8 mt-8">
        <h2 className="text-lg font-semibold text-[#5C7934] mb-2">Location</h2>
        <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden shadow">
          <PropertyMap coordinates={property.coordinate} />
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal show={openImage} onClose={() => setOpenImage(false)}>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {property.images.map((img) => (
            <img
              key={img.id}
              src={`${imageBasePath}${img.image_url}`}
              alt={`Image ${img.id}`}
              className="w-full h-48 object-cover rounded-lg shadow"
            />
          ))}
        </div>
      </ImageModal>
    </AuthenticatedLayout>
  );
};

export default ShowProperty;
