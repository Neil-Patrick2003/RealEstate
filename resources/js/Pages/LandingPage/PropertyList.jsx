import React, {useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faExpand, faHeart, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import { Link } from '@inertiajs/react'
import { Heart } from 'lucide-react';

const PropertyList = ({properties}) => {

    const [ isFavourite, setIsFavourite ] = useState(false);

  return (
      <div className='h-screen px-4 md:px-8 lg:px-32'>
        <h1 className='text-white text-2xl font-bold'>All Properties</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="relative h-48">
                          <img src={`/storage/${property.image_url}`}className="w-full h-full object-cover"/>
                          <div className="absolute top-4 right-4 bg-[#5C7934] text-white px-2 py-1 rounded-full text-xs font-medium">
                              {property.isPresell ? 'Pre sell' : 'For Sale'}
                          </div>
                          <button className="absolute top-4 left-4 bg-[#5C7934] text-white px-2 py-2 rounded-full text-xs font-medium" onClick={() => setIsFavourite(!isFavourite)}>
                              {isFavourite ? (
                                  <Heart className='h-5 w-5' />
                              ) : (
                                  <FontAwesomeIcon icon={faHeart} className='h-5 w-5'/>
                              )}

                          </button>
                      </div>
                      <div className="p-6 w-full">
                          <h3 className="text-xl font-semibold text-[#5C7934] mb-1">Contemporary Valley Home</h3>
                          <p className="text-gray-600 mb-3">
                              <i className="fas fa-map-marker-alt text-sm mr-1 text-[#FFA500]"></i>
                              456 Modern Terrace
                          </p>
                          <div className="flex  justify-between items-center mb-4">
                              <div className="flex items-center text-gray-700">
                                  <i className="fas fa-bed mr-1 text-[#5C7934]"></i>
                                  <span className="mr-4">3</span>
                                  <i className="fas fa-bath mr-1 text-[#5C7934]"></i>
                                  <span>2</span>
                              </div>
                              <div className="font-bold text-[#5C7934]">₱ 7,850,000</div>
                          </div>
                          <Link href={`/properties/${property.id}`} className='flex bg-primary justify-center text-white font-bold py-2  rounded-lg'>
                              View
                          </Link>

                      </div>
                  </div>
                  // <div
                  //     key={property.id}
                  //     className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 flex flex-col"
                  // >
                  //     <div className="relative w-full h-[160px] p-2">
                  //         <img
                  //             src={property.image_url ? `/storage/${property.image_url}` : '/fallback-image.png'}
                  //             alt={property.title}
                  //             onError={(e) => (e.currentTarget.src = '/fallback-image.png')}
                  //             className="w-full h-full object-cover rounded-lg"
                  //         />
                  //
                  //         <div className="absolute top-4 left-4 bg-primary text-white text-sm px-3 py-1 rounded-md shadow">
                  //             ₱{property.price?.toLocaleString() || 'N/A'}
                  //         </div>
                  //     </div>
                  //
                  //     <div className="p-4 flex flex-col justify-between h-full">
                  //         <div className="text-xs text-gray-400 font-medium uppercase mb-2">
                  //             <span>Posted date: </span>
                  //             {property.created_at
                  //                 ? new Date(property.created_at).toLocaleDateString()
                  //                 : 'N/A'}
                  //         </div>
                  //
                  //         <h2 className="text-lg font-bold mb-3 text-primary truncate">{property.title}</h2>
                  //
                  //         <p className="text-sm text-gray-500 mb-2">{property.property_type}</p>
                  //         <p className="text-sm text-gray-600 truncate mb-2"><span><FontAwesomeIcon icon={faLocationDot} className='text-secondary mr-2'/></span>{property.address}</p>
                  //         <p className="text-sm text-gray-600 truncate mb-2"><span><FontAwesomeIcon icon={faExpand} className='text-blue-300 mr-2 '/></span>{property?.lot_area}{property?.floor_area}</p>
                  //
                  //
                  //
                  //         <Link href={`/properties/${property.id}`} className='flex bg-primary justify-center text-white font-bold py-2 text-sm  rounded-lg'>View</Link>
                  //     </div>
                  //
                  //
                  // </div>


              ))}
          </div>
      </div>
  );
};

export default PropertyList;
