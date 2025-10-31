// resources/js/Pages/Property/PropertyInMapShow.jsx
import ImageGallery from "@/Pages/Property/ImageGallery.jsx";
import DescriptionSection from "@/Pages/Property/DescriptionSection.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import { Link, Head } from '@inertiajs/react'; // Import Head for SEO
import React, { useState } from "react"; // Removed unused useEffect/ImageModal
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons"; // Added faMapMarkerAlt

// PHP Currency Formatter
const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

export default function PropertyInMapShow({ property }) {
    // Destructure property details for cleaner use
    const {
        title,
        price,
        address,
        lot_area,
        floor_area,
        property_type,
        sub_type,
        car_slots,
        features,
        total_rooms,
        bedrooms,
        bathrooms,
        description,
        coordinate,
        image_url,
        images,
    } = property;

    return (
        <div className='bg-gray-50 min-h-screen'>
            <Head title={title || "Property Details"} />

            {/* --- Header / Back Button Section --- */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-10 bg-white shadow-sm border-b border-gray-100'>
                <Link href='/maps' className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition'>
                    <FontAwesomeIcon icon={faChevronLeft} className='mr-2 w-3 h-3' />
                    Back to Map View
                </Link>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex flex-col gap-8'>

                {/* --- Property Title and Price Section --- */}
                <header className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className='text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight'>
                                {title || 'Untitled Property'}
                            </h1>
                            <p className="flex items-center text-sm text-gray-600 mt-1">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className='mr-2 w-3 h-3 text-indigo-500' />
                                {address || 'Address not available'}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <p className='text-3xl font-black text-indigo-600'>
                                {currency.format(price)}
                            </p>
                            <p className="text-sm text-gray-500 text-right mt-0.5">
                                Asking Price
                            </p>
                        </div>
                    </div>
                </header>

                {/* --- Main Content Grid (Gallery & Description) --- */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

                    {/* Column 1 & 2: Image Gallery */}
                    <div className='lg:col-span-2'>
                        <ImageGallery image_url={image_url} images={images} />
                    </div>

                    {/* Column 3: Key Details / Features */}
                    <div className='lg:col-span-1'>
                        <DescriptionSection
                            description={description}
                            lot_area={lot_area}
                            property_type={property_type}
                            title={title} // Title passed for potential internal use by DescriptionSection
                            price={price} // Price passed for potential internal use by DescriptionSection
                            address={address} // Address passed for potential internal use by DescriptionSection
                            sub_type={sub_type}
                            floor_area={floor_area}
                            car_slots={car_slots}
                            features={features}
                            total_rooms={total_rooms}
                            bedrooms={bedrooms}
                            bathrooms={bathrooms}
                            // Pass only the necessary props if DescriptionSection handles the layout
                            // We are using DescriptionSection as a dedicated "Summary/Features" panel here
                        />
                    </div>
                </div>

                {/* --- Map Section (Full Width) --- */}
                <section className="mt-4">
                    <h2 className='text-2xl font-bold text-gray-900 mb-4 border-b pb-2'>
                        Location Overview
                    </h2>
                    <div className='bg-white rounded-xl shadow-lg overflow-hidden h-[400px] border border-gray-100'>
                        {coordinate ? (
                            <PropertyMap coordinates={coordinate}/>
                        ) : (
                            <div className='h-full flex items-center justify-center text-gray-500'>
                                Map coordinates not available for this property.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
