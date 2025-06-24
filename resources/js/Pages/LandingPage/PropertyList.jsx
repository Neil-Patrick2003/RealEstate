import React from 'react';

const PropertyList = () => {
  return (
    <div className="h-screen bg-background flex flex-col justify-center items-center text-center px-4">
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        No Properties Published
      </h2>
      <p className="text-gray-500 text-sm">
        Once you publish a property, it will appear here.
      </p>
    </div>
  );
};

export default PropertyList;
