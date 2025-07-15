import React from "react";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import dayjs from "dayjs";
import { Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapMarkerAlt, faUserTag, faCalendar, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function Show({ user }) {
    const formatField = (field) => field || "-";

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this agent?")) {
            router.delete(`/agents/${user.id}`);
        }
    };

    return (
        <BrokerLayout>
            <div className="max-w-4xl mx-auto mt-10 p-8 bg-white border border-gray-300 shadow-sm rounded-lg">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-800">Agent Profile</h1>
                    <Link
                        href={`/agents/${user.id}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md transition"
                    >
                        Edit Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Picture and Delete Button */}
                    <div className="flex flex-col items-center gap-4">
                        <img
                            src={`/storage/${user.photo_url}`}
                            alt={user.name}
                            className="w-40 h-40 rounded-full border border-gray-300 object-cover"
                        />
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-md"
                        >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Delete Agent
                        </button>
                    </div>

                    {/* Right Column: Information */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{user.name}</h2>
                        <ul className="space-y-3 text-gray-700 text-sm">
                            <li className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 w-4" />
                                <span>{formatField(user.email)}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="text-gray-500 w-4" />
                                <span>{formatField(user.phone || user.contact_number)}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 w-4" />
                                <span>{formatField(user.address)}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendar} className="text-gray-500 w-4" />
                                <span>Joined on {dayjs(user.created_at).format("MMMM D, YYYY")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserTag} className="text-gray-500 w-4" />
                                <span>{formatField(user.role)}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Status:</span>
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-300">
                                    {formatField(user.status)}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </BrokerLayout>
    );
}
