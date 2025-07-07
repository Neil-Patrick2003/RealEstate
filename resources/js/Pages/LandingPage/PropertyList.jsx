import React from 'react';

const PropertyList = ({properties}) => {
    console.log(properties);
  return (
      <div className='h-screen px-4 md:px-8 lg:px-20'>
        <h1 className='text-white text-2xl font-bold'>All Properties</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {properties.map((property) => (
                  <div
                      key={property.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 flex flex-col"
                  >
                      <div className="relative w-full h-[160px] p-2">
                          <img
                              src={property.image_url ? `/storage/${property.image_url}` : '/fallback-image.png'}
                              alt={property.title}
                              onError={(e) => (e.currentTarget.src = '/fallback-image.png')}
                              className="w-full h-full object-cover rounded-lg"
                          />

                          <div className="absolute top-4 left-4 bg-primary text-white text-sm px-3 py-1 rounded-md shadow">
                              ₱{property.price?.toLocaleString() || 'N/A'}
                          </div>
                      </div>
                      <div className="p-4 flex flex-col justify-between h-full">
                          <h2 className="text-lg font-bold text-primary truncate">{property.title}</h2>
                          <p className="text-sm text-gray-500">{property.property_type}</p>
                          <p className="text-sm text-gray-600 truncate">{property.address}</p>
                          <p className="text-sm text-gray-600 truncate">{property?.lot_area}{property?.floor_area}</p>


                          <div className="mt-2 text-sm text-gray-400">
                              <span className="italic">Posted on:</span>{' '}
                              {property.created_at
                                  ? new Date(property.created_at).toLocaleDateString()
                                  : 'N/A'}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );
};

export default PropertyList;
