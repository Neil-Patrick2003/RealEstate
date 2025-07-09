import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import BuyerInquiriesFilterTab from "@/Components/tabs/BuyerInquiriesFilterTab.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faClock,
    faPaperPlane,
    faTrashAlt,
    faCalendarCheck,
    faHouseChimney,
    faPesoSign,
    faEnvelope,
    faPhone
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function Inquiries({ inquiries }) {
    return (
        <BuyerLayout>
            <div className="py-6 px-4">
                <h1 className="text-primary text-3xl font-bold mb-3">My Inquiries</h1>
                <p className="text-gray-600 font-medium mb-6">
                    Keep track of all your property inquiries and agent communications.
                </p>

                <div className="flex justify-between items-center mb-5">
                    <BuyerInquiriesFilterTab />
                    <p className="text-sm text-gray-500 italic">Filter by status, date or agent</p>
                </div>

                {inquiries.data.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">No inquiries yet.</p>
                ) : (
                    inquiries.data.map((inquiry) => (
                        <div
                            key={inquiry.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 hover:shadow-md transition-all"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">
                                {/* Property Image */}
                                <div className="col-span-12 lg:col-span-3">
                                    <div className="relative rounded-lg overflow-hidden h-48 shadow-sm">
                                        <img
                                            src={`/storage/${inquiry.property.image_url}`}
                                            onError={(e) => (e.target.src = "/placeholder.png")}
                                            alt={inquiry.property.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                            <FontAwesomeIcon icon={faPesoSign} />
                                            {inquiry.property.price.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Property Info */}
                                <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-primary leading-tight">
                                                {inquiry.property.title}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    inquiry.status === 'accepted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : inquiry.status === 'rejected'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                {inquiry.status}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-1">
                                            <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                            {inquiry.property.address}
                                        </p>

                                        <p className="text-xs text-gray-500 mb-3">
                                            <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                            {inquiry.property.property_type} – {inquiry.property.sub_type}
                                        </p>

                                        {/* Message preview */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                                            <p className="text-sm text-gray-700 line-clamp-2">
                                                <strong>Your message: </strong>
                                                {inquiry.messages?.message || "No message provided."}
                                            </p>
                                        </div>

                                        <p className="text-xs text-gray-400">
                                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                                            Sent {dayjs(inquiry.created_at).fromNow()}
                                        </p>
                                    </div>
                                </div>

                                {/* Agent + Actions */}
                                <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border">
                                            <img
                                                src="https://placehold.co/80x80"
                                                alt={inquiry.agent.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{inquiry.agent.name}</p>
                                            <p className="text-xs text-gray-500">4.8 ⭐ (76 reviews)</p>
                                        </div>
                                    </div>

                                    {/* Agent Contact Info - placeholder */}
                                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                                        <p><FontAwesomeIcon icon={faEnvelope} className="mr-1" /> agent@email.com</p>
                                        <p><FontAwesomeIcon icon={faPhone} className="mr-1" /> +63 912 345 6789</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        {inquiry.status === 'accepted' && (
                                            <button className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium transition">
                                                <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                                Schedule Visit
                                            </button>
                                        )}

                                        {/* Reply & Delete Buttons in Row */}
                                        <div className="flex gap-x-2">
                                            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition">
                                                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                Reply
                                            </button>
                                            <button className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition">
                                                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </BuyerLayout>
    );
}
