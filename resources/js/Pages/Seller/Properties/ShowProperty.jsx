import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLocationDot,
    faExpand,
    faTags,
    faBuilding,
    faHouseChimney,
    faTruckRampBox,
    faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';
import PropertyMap from '@/Components/PropertyMap';
import ImageModal from '@/Components/modal/ImageModal.jsx';
import DescriptionSection from "@/Pages/Property/DescriptionSection.jsx";

const ShowProperty = ({ property }) => {
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
            <div className="px-6 py-4">
                <Link
                    href="/seller/properties"
                    className="text-sm text-[#5C7934] hover:text-[#719440] flex items-center gap-1"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Back
                </Link>
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
                                onClick={() => {
                                    if (isLast && isDesktop && moreCount > 0) {
                                        setOpenImage(true);
                                    }
                                }}
                            >
                                <img
                                    src={`${imageBasePath}${image.image_url}`}
                                    alt={`Gallery ${image.id}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {isLast && isDesktop && moreCount > 0 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-semibold text-sm md:text-base backdrop-blur-sm group-hover:bg-opacity-50">
                                        +{moreCount} more
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DESCRIPTION SECTION */}
            <div className="px-4 md:px-8 mt-8">
                <DescriptionSection
                    description={property.description}
                    title={property.title}
                    address={property.address}
                    property_type={property.property_type}
                    features={property.features}
                    car_slots={property.car_slots}
                    total_rooms={property.total_rooms}
                    floor_area={property.floor_area}
                    lot_area={property.lot_area}
                    price={property.price}
                    bathrooms={property.bathrooms}
                    bedrooms={property.bedrooms}
                    sub_type={property.sub_type}
                />
            </div>

            {/* MAP */}
            <div className="px-4 md:px-8 mt-8">
                <h2 className="text-lg font-semibold text-[#5C7934] mb-2">Map</h2>
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
