import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faExpand, faTags } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';
import PropertyMap from '@/Components/PropertyMap';
import ImageModal from '@/Components/Modal/ImageModal';
import Modal from '@/Components/Modal';

const ShowProperty = ({ property }) => {
  const imageBasePath = '/storage/';
  const [visibleImages, setVisibleImages] = useState([]);
  const [openImage, setOpenImage] = useState(false);

  const imageRef = useRef(property.images)


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
        <Link href="/properties" className="text-sm text-[#5C7934] hover:text-[#719440]">&larr; Back to Listings</Link>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 ">
        {/* Main Image */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="col-span-1 md:col-span-2"
        >
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            src={`${imageBasePath}${property.image_url}`}
            alt={property.title}
            className="w-full h-auto max-h-[60vh] object-cover rounded-xl shadow"
          />
        </motion.div>

        {/* Side Images */}
        <div className="flex flex-row md:flex-col gap-3 overflow-x-scroll md:overflow-hidden max-h-[60vh]">
          {visibleImages.map((image, index) => {
            const isLast = index === visibleImages.length - 1;
            const isDesktop = window.innerWidth >= 768;

            if (isLast && isDesktop && property.images.length > 2) {
              return (
                <motion.div
                  key={image.id}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative w-48 h-32 md:h-[30vh] lg:h-[60vh] rounded-xl overflow-hidden border shadow cursor-pointer"
                  onClick={() => alert('Show full image gallery')}
                >
                  <img
                    src={`${imageBasePath}${image.image_url}`}
                    alt="See all"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 text-white font-semibold text-lg">
                    See All
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.img
                key={image.id}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                src={`${imageBasePath}${image.image_url}`}
                alt={`Image ${image.id}`}
                className="h-32 md:h-[24vh] w-full object-cover rounded-xl border shadow"
              />
            );
          })}
        </div>
      </div>

      {/* Property Title Section */}
      <div className="px-4 mt-6 space-y-2">
        <h1 className="text-2xl md:text-4xl font-bold font-serif text-[#5C7934]">{property.title}</h1>
        <h2 className="text-[#719440] font-semibold text-sm">{property.property_type} &bull; {property.sub_type}</h2>
        <p className="text-xs text-gray-400">Listed on {property.created_at}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2 text-[#5C7934]">
            <FontAwesomeIcon icon={faLocationDot} />
            <span>{property.address}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5C7934]">
            <FontAwesomeIcon icon={faExpand} />
            <span>{property.lot_area} sqm</span>
          </div>
          <div className="flex items-center gap-2 text-[#5C7934]">
            <FontAwesomeIcon icon={faTags} />
            <span>₱ {property.price}</span>
          </div>
        </div>
      </div>

      {/* Description and Specs */}
      <div className="mt-8 mx-4 md:mx-8 bg-white rounded-xl shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[#5C7934]">Details</h2>
          <div
            className="text-gray-700 leading-relaxed mt-2 text-sm"
            dangerouslySetInnerHTML={{ __html: property.description || '<p>No description available.</p>' }}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#5C7934]">Specifications</h2>
          <table className="w-full mt-2 text-sm text-left border border-gray-200">
            <thead className=" text-[#5C7934]">
              <tr>
                <th className="border p-2">Category</th>
                <th className="border p-2">Number</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-2">Total Room</td><td className="border p-2">{property.total_rooms}</td></tr>
              <tr><td className="border p-2">Total Bedroom</td><td className="border p-2">{property.bedrooms}</td></tr>
              <tr><td className="border p-2">Total Bathroom</td><td className="border p-2">{property.bathrooms}</td></tr>
              <tr><td className="border p-2">Car Slot</td><td className="border p-2">{property.car_slots}</td></tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-[#5C7934]">Features</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {property.features.map((feature) => (
              <span
                key={feature.id}
                className="px-4 py-1 border border-[#5C7934] text-[#5C7934] rounded-full text-sm"
              >
                {feature.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Property Map */}
      <div className="p-4 md:px-8 mt-6">
        <PropertyMap coordinates={property.coordinate} />
      </div>

      <button onClick={() => setOpenImage(true)}>Delete</button>
      <ImageModal show={openImage} onClose={() => setOpenImage(false)}>
        <div className=''>ji</div>
      </ImageModal>
    </AuthenticatedLayout>
  );
};

export default ShowProperty;