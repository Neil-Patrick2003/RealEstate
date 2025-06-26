import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm } from "@inertiajs/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBath, faBed, faDoorClosed, faShareNodes} from "@fortawesome/free-solid-svg-icons";

export default function SellerPostProperty({ properties }) {

    const imageUrl = '/storage/'; // Base path for property images

    const SendInquiryButton = ({ property }) => {
        const { post } = useForm({
            property_id: property.id,
        });

        const handleClick = () => {
            post(`/agents/properties/${property.id}/sent-inquiry`, {
                preserveScroll: true,
            });
        };

        return (
            <button
                onClick={handleClick}
                className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-md w-full"
            >
                Send Inquiry
            </button>
        );
    };

    console.log(properties);


    return (
        <AgentLayout>
            <div>
                <h1 className='text-xl font-bold'>All Properties</h1>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4'>
                {properties.map((property) => (
                    <div key={property.id} className='border rounded-xl shadow-sm'>
                        <img
                            src={`${imageUrl}${property.image_url}`}
                            className='object-cover rounded-t-xl w-full h-[40vh]'
                        />
                        <div className='flex flex-col p-4 gap-4 '>
                            <h1 className='flex-center-between text-2xl font-bold text-primary'>₱ {property.price}
                                <span>
                                    <FontAwesomeIcon icon={faShareNodes} />
                                </span>
                            </h1>
                            <h1 className="text-md font-semibold truncate max-w-[250px] overflow-hidden whitespace-nowrap" title={property.title}>
                                {property.title}
                            </h1>
                            <div className='grid grid-cols-3 text-gray-400'>
                                <div className=' flex gap-2 text-sm  hover:text-primary' >
                                    <FontAwesomeIcon icon={faDoorClosed} />
                                    <span>{property.total_rooms}</span>
                                </div>
                                <div className='flex gap-2 text-sm hover:text-primary'>
                                    <FontAwesomeIcon icon={faBed} />
                                    <span>{property.bedrooms}</span>
                                </div>
                                <div className='flex gap-2 text-sm hover:text-primary'>
                                    <FontAwesomeIcon icon={faBath} />
                                    <span>{property.bathrooms}</span>
                                </div>

                            </div>
                            <div className='flex flex-col gap-2'>
                                <button className='border text-center w-full py-2 border-primary etxt-primary rounded-md text-sm hover:bg-primary hover:text-white  hover:shadow-md cursor-pointer'>View Details</button>
                                <SendInquiryButton property={property} />
                            </div>

                        </div>
                    </div>
                ))}


            </div>
        </AgentLayout>
    );
}
