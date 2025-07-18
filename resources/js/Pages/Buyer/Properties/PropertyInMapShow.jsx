import ImageGallery from "@/Pages/Property/ImageGallery.jsx";
import DescriptionSection from "@/Pages/Property/DescriptionSection.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import { Link } from '@inertiajs/react';
import ImageModal from "@/Components/modal/ImageModal.jsx";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";

export default function PropertyInMapShow({property}){


    return(
        <div className='max-w-7xl mx-auto flex flex-col gap-6'>
            <div className='mt-6'>
                <Link href='/maps' >
                    <FontAwesomeIcon icon={faChevronLeft} className='mr-2' />
                    Back
                </Link>
            </div>
            <ImageGallery image_url={property.image_url} images={property.images}/>
            <DescriptionSection
                description={property.description}
                lot_area={property.lot_area}
                property_type={property.property_type}
                title={property.title}
                price={property.price}
                address={property.address}
                sub_type={property.sub_type}
                floor_area={property.floor_area}
                car_slots={property.car_slots}
                features={property.features}
                total_rooms={property.total_rooms}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
            />
            <PropertyMap coordinates={property.coordinate}/>

         </div>

    );
}
