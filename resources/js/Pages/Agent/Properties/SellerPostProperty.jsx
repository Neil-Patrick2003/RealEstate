import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBath, faBed, faDoorClosed, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function SellerPostProperty({ properties }) {
    const imageUrl = '/storage/'; // Base path for property images
    const fallbackImage = '/placeholder.png'; // Use your placeholder path

    const SendInquiryButton = ({ property }) => {
        const { post, processing } = useForm({ property_id: property.id });
        const [imageError, setImageError] = useState(false);

        const handleClick = () => {
            if (!processing) {
                post(`/agents/properties/${property.id}/sent-inquiry`, {
                    preserveScroll: true,
                    only: ['flash'],
                });
            }
        };

        return (
            <button
                onClick={handleClick}
                disabled={processing}
                className={`bg-primary text-white text-sm font-medium px-4 py-2 rounded-md w-full transition
          ${processing ? "opacity-60 cursor-not-allowed" : "hover:bg-primary-dark"}`}
            >
                {processing ? "Sending..." : "Send Inquiry"}
            </button>
        );
    };

    return (
        <AgentLayout>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">All Properties</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {properties.map((property) => (
                    <article
                        key={property.id}
                        className="border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                        <img
                            src={property.image_url ? `${imageUrl}${property.image_url}` : fallbackImage}
                            alt={property.title || "Property image"}
                            onError={(e) => { e.currentTarget.src = fallbackImage; }}
                            className="object-cover rounded-t-xl w-full h-[40vh]"
                            loading="lazy"
                        />

                        <div className="flex flex-col p-4 gap-4 flex-grow">
                            <div className="flex justify-between items-center text-2xl font-bold text-primary">
                                <span>₱ {property.price.toLocaleString()}</span>
                                <FontAwesomeIcon icon={faShareNodes} />
                            </div>

                            <h2
                                className="text-md font-semibold truncate max-w-full overflow-hidden whitespace-nowrap"
                                title={property.title}
                            >
                                {property.title}
                            </h2>

                            <div className="grid grid-cols-3 text-gray-400">
                                <div className="flex gap-2 text-sm hover:text-primary transition cursor-default">
                                    <FontAwesomeIcon icon={faDoorClosed} />
                                    <span>{property.total_rooms}</span>
                                </div>
                                <div className="flex gap-2 text-sm hover:text-primary transition cursor-default">
                                    <FontAwesomeIcon icon={faBed} />
                                    <span>{property.bedrooms}</span>
                                </div>
                                <div className="flex gap-2 text-sm hover:text-primary transition cursor-default">
                                    <FontAwesomeIcon icon={faBath} />
                                    <span>{property.bathrooms}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-auto">
                                <button
                                    type="button"
                                    title="View property details"
                                    className="border border-primary text-primary text-center w-full py-2 rounded-md text-sm hover:bg-primary hover:text-white hover:shadow-md transition"
                                >
                                    View Details
                                </button>

                                <SendInquiryButton property={property} />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </AgentLayout>
    );
}
