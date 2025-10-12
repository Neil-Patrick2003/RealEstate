import { useForm, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import InputError from "@/Components/InputError.jsx";
import InputWithLabel from "@/Components/InputWithLabel.jsx";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout.jsx";
import { ChevronLeft } from "lucide-react";

export default function Create({ user, brokers }) {
    const { data, setData, processing, post, patch, reset, errors } = useForm({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "",
        address: user?.address || "",
        photo_url: "",
        contact_number: user?.contact_number || "",
        status: user?.status || "active",
        broker_id: user?.broker_id || "",
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {

        setData({
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "",
            address: user?.address || "",
            photo_url: "",
            contact_number: user?.contact_number || "",
            status: user?.status || "active",
            broker_id: user?.broker_id || "",
        });


        if (user?.photo_url) {
            setPreview(`/storage/${user.photo_url}`);
        } else {
            setPreview(null);
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setData("photo_url", file);
        }
    };

    const closeModal = () => {
        reset();
        setPreview(null);
    };

    const submit = (e) => {
        e.preventDefault();

        if (!user) {
            post(route("admin.users.store"), {
                onSuccess: () => {
                    reset();
                },
                forceFormData: true,
            });
        } else {
            patch(route("admin.users.update", user.id), {
                onSuccess: () => {
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout>
            {/* ✅ DESIGN UNCHANGED */}
            <div className="flex-center flex-row gap-4 mb-6">
                <Link href="/admin/users">
                    <ChevronLeft className="text-gray-600" />
                </Link>
                <h1 className="text-xl text-text font-bold">
                    {user ? "Edit" : "Create"} Agent
                </h1>
            </div>

            <form
                onSubmit={submit}
                className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
                {/* Profile Upload */}
                <div className="flex flex-col border rounded-xl border-gray-100 shadow drop-shadow-xl items-center justify-center w-full">

                    <div className="relative w-40 h-40 mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 animate-spin-slow pointer-events-none"></div>

                        <label
                            htmlFor="profile_upload"
                            className="relative z-10 w-full h-full rounded-full overflow-hidden cursor-pointer group bg-gray-100 shadow-md flex items-center justify-center"
                        >
                            {!preview ? (
                                <div className="flex flex-col items-center justify-center text-center px-4">
                                    <div className="bg-white p-2 rounded-full shadow">
                                        <FontAwesomeIcon
                                            icon={faCamera}
                                            className="text-gray-500 w-6 h-6"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">
                                        Upload Photo
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <img
                                        src={preview}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <FontAwesomeIcon
                                            icon={faCamera}
                                            className="text-white w-5 h-5 mb-1"
                                        />
                                        <span className="text-xs text-white">
                                            Change Photo
                                        </span>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>

                    <input
                        type="file"
                        id="profile_upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />

                    <p className="text-xs text-gray-500 text-center">
                        JPG, PNG, GIF – Max 3MB
                    </p>
                    <InputError message={errors.photo_url} className="mt-2" />
                </div>

                {/* Form Section */}
                <div className="col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputWithLabel
                                    id="name"
                                    name="name"
                                    label="Full Name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <InputWithLabel
                                    id="contact_number"
                                    name="contact_number"
                                    label="Phone Number"
                                    value={data.contact_number}
                                    onChange={(e) =>
                                        setData("contact_number", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.contact_number}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <InputWithLabel
                                    id="address"
                                    name="address"
                                    label="Address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData("address", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.address}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <InputWithLabel
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
                            Account Settings
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        setData("role", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 text-gray-400 rounded-md focus:ring focus:ring-blue-200"
                                >
                                    <option value="">Select role</option>
                                    <option value="Buyer">Buyer</option>
                                    <option value="Seller">Seller</option>
                                    <option value="Agent">Agent</option>
                                    <option value="Broker">Broker</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <InputError
                                    message={errors.role}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="status"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 text-gray-400 rounded-md focus:ring focus:ring-blue-200"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                                <InputError
                                    message={errors.status}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="broker_id"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Assign Broker
                                </label>
                                <select
                                    id="broker_id"
                                    name="broker_id"
                                    value={data.broker_id}
                                    onChange={(e) =>
                                        setData("broker_id", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 text-gray-400 rounded-md focus:ring focus:ring-blue-200"
                                >
                                    <option value="">Select broker</option>
                                    {brokers.map((broker) => (
                                        <option key={broker.id} value={broker.id}>
                                            {broker.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.broker_id}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-md bg-primary text-white hover:bg-accent transition"
                        >
                            {processing
                                ? user
                                    ? "Saving..."
                                    : "Creating..."
                                : user
                                    ? "Save Changes"
                                    : "Create"}
                        </button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
