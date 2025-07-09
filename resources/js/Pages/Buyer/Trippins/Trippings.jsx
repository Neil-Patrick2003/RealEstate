import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faClock,
    faLocationDot,
    faHouseChimney,
    faEnvelope,
    faPhone,
    faTrashAlt,
    faPaperPlane,
    faPesoSign,
    faMapMarkerAlt,
    faUserTie, faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend Day.js with relativeTime
dayjs.extend(relativeTime);

export default function Trippings({ trippings }) {
    return (
        <BuyerLayout>
            <div className="px-4 py-6">
                <h1 className="text-2xl font-bold text-primary mb-4">📅 Scheduled Trippings</h1>

                {trippings.length === 0 ? (
                    <p className="text-gray-500">No trippings scheduled yet.</p>
                ) : (
                    <div className="space-y-6">
                        {trippings.map((tripping) => (
                            <div
                                key={tripping.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 hover:shadow-md transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 p-6">
                                    {/* Property Image */}
                                    <div className="col-span-12 lg:col-span-3">
                                        <div className="relative rounded-lg overflow-hidden h-48 shadow-sm">
                                            <img
                                                src={`/storage/${tripping.property.image_url}`}
                                                onError={(e) => (e.target.src = "/placeholder.png")}
                                                alt={tripping.property.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <FontAwesomeIcon icon={faPesoSign} />
                                                {parseFloat(tripping.property.price).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="col-span-12 lg:col-span-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-primary leading-tight">
                                                    {tripping.property.title}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        tripping.status === 'accepted'
                                                            ? 'bg-green-100 text-green-800'
                                                            : tripping.status === 'rejected'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                    {tripping.status}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-1">
                                                <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                                                {tripping.property.address}
                                            </p>

                                            <p className="text-xs text-gray-500 mb-2">
                                                <FontAwesomeIcon icon={faHouseChimney} className="mr-1" />
                                                {tripping.property.property_type} – {tripping.property.sub_type}
                                            </p>

                                            <p className="text-sm text-gray-700 mb-2">
                                                <FontAwesomeIcon icon={faCalendarCheck} className="mr-1 text-primary" />
                                                Visit Date:{" "}
                                                <strong>{dayjs(tripping.visit_date).format("MMMM D, YYYY")}</strong>
                                            </p>

                                            <p className="text-sm text-gray-700 mb-2">
                                                <FontAwesomeIcon icon={faClock} className="mr-1 text-primary" />
                                                Visit Time:{" "}
                                                <strong>{dayjs(`1970-01-01T${tripping.visit_time}`).format("hh:mm A")}</strong>
                                            </p>

                                            {tripping.notes && (
                                                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                                    <p className="text-sm text-gray-700">
                                                        <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-primary" />
                                                        <strong>Notes:</strong> {tripping.notes}
                                                    </p>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-400 mt-2">
                                                Sent {dayjs(tripping.created_at).fromNow()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Agent Info & Actions */}
                                    <div className="col-span-12 lg:col-span-3 flex flex-col justify-between">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border">
                                                <img
                                                    src={tripping.agent.photo_url || "https://placehold.co/80x80"}
                                                    alt={tripping.agent.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{tripping.agent.name}</p>
                                                <p className="text-xs text-gray-500">{tripping.agent.email}</p>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-500 mb-4 space-y-1">
                                            {tripping.agent.contact_number && (
                                                <p><FontAwesomeIcon icon={faPhone} className="mr-1" /> {tripping.agent.contact_number}</p>
                                            )}
                                        </div>

                                        <div className="flex gap-x-2">
                                            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition">
                                                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                                                Message
                                            </button>
                                            <button className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition">
                                                <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}
