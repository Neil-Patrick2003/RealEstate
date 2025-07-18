import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import ImageGallery from "@/Pages/Property/ImageGallery.jsx";
import DescriptionSection from "@/Pages/Property/DescriptionSection.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft, faEnvelope, faLocationDot, faMessage, faPhone} from "@fortawesome/free-solid-svg-icons";
import chevronLeftIcon from "@heroicons/react/16/solid/esm/ChevronLeftIcon.js";
import { Link } from '@inertiajs/react';
 export default function Show({property}){
    const seller = property?.seller;
    const agent = property?.agent;

    console.log(seller);
    return (
        <BrokerLayout>
            <Link href='/broker/properties' className='text-gray-500 mb-6'><FontAwesomeIcon icon={faChevronLeft} /> <span>Back</span></Link>
            <div className='flex flex-col gap-4'>
                <ImageGallery image_url={property.property.image_url} images={property.property.images} />
                <DescriptionSection
                    title={property.property.title}
                    property_type={property.property.property_type}
                    sub_type={property.property.sub_type}
                    price={property.property.price}
                    address={property.property.address}
                    lot_area={property.property.lot_area}
                    floor_area={property.property.floor_area}
                    bedrooms={property.property.bedrooms}
                    bathrooms={property.property.bathrooms}
                    car_slots={property.property.car_slots}
                    description={property.property.description}
                    total_rooms={property.total_rooms}
                    features={property.property.features}
                />
                <div className="grid md:grid-cols-2 gap-6 ">

                    {/* Seller Info */}
                    <div className="flex flex-col gap-3 border p-6 rounded-lg shadow-sm">
                        <p className="text-gray-500 font-semibold uppercase tracking-wide">Seller Information</p>
                        <p className="text-xl font-bold text-primary">{seller.name}</p>

                        <div className="text-sm text-gray-700 space-y-1">
                            <p><FontAwesomeIcon icon={faEnvelope} className='text-gray-500 mr-2' /> <span className="text-gray-500">{seller.email}</span></p>
                            <p><FontAwesomeIcon icon={faPhone}  className='text-gray-500 mr-2' /> <span className="text-gray-500">{seller.contact_number}</span></p>
                            <p><FontAwesomeIcon icon={faLocationDot}  className='text-gray-500 mr-2' /> <span className="text-gray-500">{seller.address}</span></p>
                            <button className='bg-secondary text-white rounded-2xl px-4 py-2 font-bold'>
                                <FontAwesomeIcon icon={faMessage} className='mr-2'/>
                                Message
                            </button>
                        </div>

                    </div>

                    {/* Agent Info */}
                    <div className="flex flex-col gap-3 border p-6 rounded-lg shadow-sm">
                        <p className="text-gray-500 font-semibold uppercase tracking-wide">Agent Information</p>
                        <p className="text-xl font-bold text-primary">{agent.name}</p>

                        <div className="text-sm text-gray-700 space-y-1">
                            <p><FontAwesomeIcon icon={faEnvelope} className='text-gray-500 mr-2' /> <span className="text-gray-500">{agent.email}</span></p>
                            <p><FontAwesomeIcon icon={faPhone}  className='text-gray-500 mr-2' /> <span className="text-gray-500">{agent.contact_number}</span></p>
                            <p><FontAwesomeIcon icon={faLocationDot}  className='text-gray-500 mr-2' /> <span className="text-gray-500">{agent.address}</span></p>
                            <button className='bg-secondary text-white rounded-2xl px-4 py-2 font-bold'>
                                <FontAwesomeIcon icon={faMessage} className='mr-2'/>
                                Message
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </BrokerLayout>
    );
}
