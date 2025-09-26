import AdminLayout from "@/Layouts/AdminLayout.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendar,
    faEnvelope,
    faMapMarkerAlt,
    faPhone,
    faTrash,
    faUserTag,
    faToggleOn,
    faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import React, { useState } from "react";

export default function Edit({ user }) {
    const [status, setStatus] = useState(user.status || "inactive");

    const formatField = (field) => field || "-";

    const handleDelete = () => {
        console.log("Delete user:", user.id);
    };

    const handleToggleStatus = () => {
        const newStatus = status === "active" ? "suspended" : "active";
        setStatus(newStatus);

        // 🚀 Send request to backend to update status
        console.log("Toggling status to:", newStatus);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700 border-green-300";
            case "suspended":
                return "bg-orange-100 text-orange-700 border-orange-300";
            case "inactive":
                return "bg-red-100 text-red-700 border-red-300";
            default:
                return "bg-gray-100 text-gray-600 border-gray-300";
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Edit {user.name}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Picture and Actions */}
                    <div className="flex flex-col items-center gap-6 border p-6 rounded-2xl shadow-sm bg-white">
                        {user?.photo_url ? (
                            <img
                                src={`/storage/${user.photo_url}`}
                                alt={user.name}
                                className="w-40 h-40 rounded-full border border-gray-300 object-cover shadow-md"
                            />
                        ) : (
                            <img
                                src={`https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg`}
                                alt={user.name}
                                className="w-40 h-40 rounded-full border border-gray-300 object-cover shadow-md"
                            />
                        )}

                        {/* Status Toggle */}
                        <button
                            onClick={handleToggleStatus}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition
                                ${status === "active"
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                        >
                            <FontAwesomeIcon
                                icon={status === "active" ? faToggleOff : faToggleOn}
                            />
                            {status === "active" ? "Suspend User" : "Activate User"}
                        </button>

                        {/* Delete */}
                        <button
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-md shadow-sm flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete User
                        </button>
                    </div>

                    {/* Right Column: Information */}
                    <div className="md:col-span-2 border p-6 rounded-2xl shadow-sm bg-white">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            User Information
                        </h2>
                        <ul className="space-y-4 text-gray-700 text-sm">
                            <li className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="text-gray-500 w-4"
                                />
                                <span>{formatField(user.email)}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faPhone}
                                    className="text-gray-500 w-4"
                                />
                                <span>{formatField(user.phone || user.contact_number)}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faMapMarkerAlt}
                                    className="text-gray-500 w-4"
                                />
                                <span>{formatField(user.address)}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faCalendar}
                                    className="text-gray-500 w-4"
                                />
                                <span>
                                    Joined on{" "}
                                    {dayjs(user.created_at).format("MMMM D, YYYY")}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faUserTag}
                                    className="text-gray-500 w-4"
                                />
                                <span>{formatField(user.role)}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">
                                    Status:
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                        status
                                    )}`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
