import NavBar from "@/Components/NavBar.jsx";
import ImageGallery from "@/Pages/Property/ImageGallery.jsx";
import DescriptionSection from "@/Pages/Property/DescriptionSection.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import {router} from "@inertiajs/react";
import React, {useState} from "react";
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import ToastHandler from "@/Components/ToastHandler.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import { Link } from '@inertiajs/react';

export default function ShowInquiry({property, inquiry, deal}){
    const [isOpenDealForm, setIsOpenDealForm] = useState(false)
    const [ message, setMessage] = useState('');


    const handleSubmitInquiry = () => {
        router.post(`/properties/${property.id}`, {
                message: message
            },
            {
                preserveScroll:true,
                onSuccess: () => {
                    setMessage(''),
                        setIsOpenModal(false);
                }
            })
    }

    return (
        <>
            <div className='pt-20 max-w-7xl mx-auto flex flex-col gap-6 p-4'>
                <NavBar />
                <ToastHandler/>
                <div className='flex-center-between'>
                    <Link href='/inquiries'>
                        <FontAwesomeIcon icon={faChevronLeft} className='mr-2' />
                        <span>
                            Back
                        </span>
                    </Link>
                    <div>
                        {
                            inquiry ? (
                                <>
                                    {inquiry?.status === 'Accepted' && (
                                        <>
                                            {
                                                property?.property_listing && <PrimaryButton onClick={() => setIsOpenDealForm(true)}>
                                                    {deal ? 'View My Offer': 'Make Offer'}
                                                </PrimaryButton>
                                            }
                                        </>
                                    )}

                                </>
                            ) : <></>
                        }
                    </div>
                </div>


                <DealFormModal isOpen={isOpenDealForm} setIsOpen={setIsOpenDealForm} property={property} initialValue={deal}/>


                <ImageGallery images={property.images} image_url={property.image_url} />
                <DescriptionSection
                    title={property.title}
                    property_type={property.property_type}
                    sub_type={property.sub_type}
                    price={property.price}
                    address={property.address}
                    lot_area={property.lot_area}
                    floor_area={property.floor_area}
                    bedrooms={property.bedrooms}
                    total_rooms={property.total_rooms}
                    bathrooms={property.bathrooms}
                    car_slots={property.car_slots}
                    description={property.description}
                    features={property.features}
                />
                <PropertyMap coordinates={property.coordinate} />
            </div>
        </>

    );
}
