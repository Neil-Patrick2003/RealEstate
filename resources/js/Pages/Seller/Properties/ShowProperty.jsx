import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faLocationDot, faExpand, faTags} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';
import PropertyMap from '@/Components/PropertyMap';

const ShowProperty = ({ property }) => {
  const imageBasePath = '/storage/';
  const [visibleImages, setVisibleImages] = useState([]);
  // console.log(property);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768; // Tailwind 'md'
      setVisibleImages(isDesktop ? property.images.slice(0, 2) : property.images);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [property.images]);

  return (
    <AuthenticatedLayout>
      <div className='px-4 py-6'>
        <Link href={'/properties'} className='text-gray-400 font-thin text-sm'>
        back</Link>
      </div>
      
      <div className="grid  grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-3 lg:px-6 xl:px-9">
        {/* Main Image */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="col-span-2"
        >
          <motion.img
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            src={`${imageBasePath}${property.image_url}`}
            alt={`Main image of ${property.title}`}
            className="w-full h-auto max-h-[60vh] object-cover rounded-xl"
          />
        </motion.div>

        {/* Side Images */}
        
        <div className="flex max-h-[50vh] overflow-x-auto flex-row md:flex-col gap-3 scroll-hidden">
          {visibleImages.map((image, index) => {
            const isLastImage = index === visibleImages.length - 1;
            const isDesktop = window.innerWidth >= 768;

            if (isLastImage && isDesktop && property.images.length > 2) {
              return (
                <motion.div
                  key={image.id}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative h-[12vh] md:h-[25vh] w-full rounded-xl overflow-hidden border cursor-pointer"
                  onClick={() => alert('Show full image gallery')}
                >
                  <img
                    src={`${imageBasePath}${image.image_url}`}
                    alt="See all"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-300 text-white font-semibold text-lg">
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
                alt={`Image ${image.id} of ${property.title}`}
                className="h-[12vh] md:h-[24vh] w-full object-cover rounded-xl border"
              />
            );
          })}
        </div>
      </div>

      {/* Title Section */}
      <div className="flex flex-col gap-y-4 px-2 md:px-8 mt-6">
        <h1 className="text-xl md:text-2xl lg:text-4xl font-bold font-serif">{property.title}</h1>
        <p className='text-gray-400 text-xs'>Created at {property.created_at}</p>
        <div className='grid grild-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4'>
          <div className='flex-center text-wrap gap-2 '>
            <FontAwesomeIcon icon={faLocationDot} className='text-gray-500'/>
            <p className='text-md text-gray-500 font-semibold'>{property.address}</p>
          </div>
          <div className='flex-center text-wrap gap-2 '>
            <FontAwesomeIcon icon={faExpand} className='text-gray-500'/>
            <p className='text-md text-gray-500 font-semibold'>{property.lot_area} sqm</p>
          </div>
          <div className='flex-center text-wrap gap-2'>
            <FontAwesomeIcon icon={faTags} className='text-gray-500'/>
            <p className='text-md text-gray-500 font-semibold'>₱ {property.price}</p>
          </div>
         
        </div>

      </div>

      {/* Description/Details Section */}
      <div className="flex flex-col m-2 px-4 py-6 gap-y-4 shadow bg-white rounded-xl">
            <h2 className='font-semibold text-lg'>Details</h2>
            <div
              className="text-lg text-gray-700 space-y-2 "
              dangerouslySetInnerHTML={{ __html: property.description || '<p>No description available.</p>' }}
            />

        <div className='space-y-4'>
          <h2 className='font-semibold text-lg'>Specification</h2>

          <table className='border-1 w-full text-gray-400'>
            <thead>
              <tr>
                <td className='border p-2'>Category</td>
                <td className='border p-2'>Number</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border p-2'>Total Room</td>
                <td className='border p-2'>{property.total_rooms}</td>
              </tr>
              <tr>
                <td className='border p-2'>Total Bedroom</td>
                <td className='border p-2'>{property.bedrooms}</td>
              </tr>
              <tr>
                <td className='border p-2'>Total Bathroom</td>
                <td className='border p-2'>{property.bathrooms}</td>
              </tr>
              <tr>
                <td className='border p-2'>Car slot</td>
                <td className='border p-2'>{property.car_slots}</td>
              </tr>
            </tbody>
          </table>


        </div>
        <PropertyMap coordinates={property.coordinate}/>
      </div>
    </AuthenticatedLayout>
  );
};

export default ShowProperty;
