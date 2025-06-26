import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { useForm } from "@inertiajs/react";

export default function SellerPostProperty({ properties }) {

    const SendInquiryButton = ({ property }) => {
        const { post } = useForm({
            property_id: property.id,
        });

        const handleClick = () => {
            post(`/agents/inquiries/${property.id}/sent-inquiry`, {
                preserveScroll: true,
            });
        };

        return (
            <button
                onClick={handleClick}
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
                Send Inquiry
            </button>
        );
    };

    return (
        <AgentLayout>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4'>
                {properties.map((property) => (
                    <div key={property.id} className='border rounded-lg shadow-sm p-3'>
                        <div className='h-40 w-full flex items-center justify-center border-b'>
                            image preview
                        </div>
                        <div className='flex flex-col gap-y-4 mt-2'>
                            <h1 className='text-lg font-semibold'>{property.title}</h1>

                            {/* ✅ Use your SendInquiryButton here */}
                            <SendInquiryButton property={property} />
                        </div>
                    </div>
                ))}
            </div>
        </AgentLayout>
    );
}
