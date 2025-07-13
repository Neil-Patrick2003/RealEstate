import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";


// Imports remain the same
export default function SellerPostProperty({ properties }) {
    const imageUrl = '/storage/';
    const fallback = '/placeholder.png';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function getAreaDisplay(property) {
        if (property.property_type === 'land') {
            return `${property.lot_area ?? 'N/A'} sqm`;
        }
        return `${property.floor_area ?? 'N/A'} sqm`;
    }


    const SendInquiryButton = ({ property }) => {
        const { post, processing } = useForm({ property_id: property.id });
        return (
            <button
                onClick={() => !processing && post(`/agents/properties/${property.id}/sent-inquiry`, { preserveScroll: true, only: ['flash'] })}
                disabled={processing}
                className={`bg-primary text-white font-medium px-4 py-2 rounded-md w-full transition ${processing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-dark'}`}
            >
                {processing ? 'Sending...' : 'Send Inquiry'}
            </button>
        );
    };

    const PropertyCard = ({ property }) => {
        const [imgErr, setImgErr] = useState(false);

        return (
            <article className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transform hover:scale-105 transition duration-200 flex flex-col">
                <div className="relative">
                    <img
                        src={!imgErr && property.image_url ? `${imageUrl}${property.image_url}` : fallback}
                        alt={property.title}
                        onError={() => setImgErr(true)}
                        className="w-full h-64 object-cover rounded-t-lg"
                        loading="lazy"
                    />
                    {property.status && (
                        <span className="absolute top-3 left-3 bg-primary/80 text-white text-xs uppercase px-2 py-1 rounded">
              {property.status}
            </span>
                    )}
                    <button className="absolute top-3 right-3 bg-white/75 p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                        <FontAwesomeIcon icon={faShareNodes} />
                    </button>
                </div>

                <div className="flex flex-col p-4 space-y-2 flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{property.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{property.location}</p>
                    <p className="text-xl font-bold text-primary flex justify-between">
                        {formatter.format(property.price)}
                        <span>{getAreaDisplay(property)}</span>
                    </p>

                    <p className="text-sm text-gray-600 truncate">
                        {property.property_type}{property.sub_type ? ` / ${property.sub_type}` : ''}
                    </p>
                    <div className="text-sm text-gray-700 space-y-1 my-2">
                        <div className="flex items-center gap-3 py-2">
                            {property.seller?.photo_url && (
                                <img
                                    src={`${imageUrl}${property.seller.photo_url}`}
                                    alt={property.seller.name}
                                    className="rounded-full h-10 w-10 object-cover border-2 border-gray-200"
                                />
                            )}
                            <div className="text-sm text-gray-700">
                                <p className="font-medium">{property.seller?.name || '—'}</p>
                                <p className="text-gray-500">Seller</p>
                            </div>
                        </div>

                    </div>

                    <div className="mt-auto flex flex-col space-y-2">
                        <Link
                            href={`/agents/properties/${property.id}`}
                            aria-label={`View details for ${property.title}`}
                            className="inline-block w-full text-center py-2 border border-primary text-primary rounded-md text-sm hover:bg-primary hover:text-white hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            View Details
                        </Link>

                        <SendInquiryButton property={property} />
                    </div>
                </div>
            </article>
        );
    };

    return (
        <AgentLayout>
            <div className="mb-6 px-4">
                <h1 className="text-2xl font-bold text-gray-900">All Properties</h1>
            </div>
            <div className="px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 gap-6">
                    {properties.length ? (
                        properties.map(p => <PropertyCard key={p.id} property={p} />)
                    ) : (
                        <p className="text-gray-500 col-span-full text-center">No properties available.</p>
                    )}
                </div>
            </div>
        </AgentLayout>
    );
}
