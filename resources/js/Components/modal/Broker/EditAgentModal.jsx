import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import InputWithLabel from "@/Components/InputWithLabel.jsx";
import InputError from "@/Components/InputError.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export default function EditAgentModal({ agent, openEditAgent, setOpenEditAgent }) {
    const { data, setData, patch, errors, processing, reset, transform } = useForm({
        name: "",
        email: "",
        contact_number: "",
        rating: "",          // <- rating in form state
        address: "",
        password: "",
        confirm_password: "",
    });

    const [preview, setPreview] = useState(null);

    const closeModal = () => {
        setOpenEditAgent(false);
        reset();
        setPreview(null);
    };

    // Coerce rating to number (or null) and only send passwords if provided
    transform((form) => {
        const payload = { ...form };

        // normalize rating
        if (payload.rating === "" || payload.rating === null || payload.rating === undefined) {
            payload.rating = null;
        } else {
            const num = Number(payload.rating);
            payload.rating = Number.isFinite(num) ? Math.min(5, Math.max(0, num)) : null;
        }

        if (!payload.password) {
            delete payload.password;
            delete payload.confirm_password;
        }
        return payload;
    });

    const submit = (e) => {
        e.preventDefault();
        if (!agent?.id) return;
        patch(`/broker/agents/update/${agent.id}`, {
            onSuccess: closeModal,
        });
    };

    useEffect(() => {
        if (agent) {
            setData({
                name: agent.name ?? "",
                email: agent.email ?? "",
                contact_number: agent.contact_number ?? "",
                rating: agent.rating ?? "",   // <- hydrate rating
                address: agent.address ?? "",
                password: "",
                confirm_password: "",
            });
            setPreview(agent.photo_url ? `/storage/${agent.photo_url}` : null);
        }
    }, [agent]);

    const title = useMemo(() => (agent ? "Edit Agent" : "Edit Agent"), [agent]);

    return (
        <Modal show={openEditAgent} onClose={closeModal} maxWidth="4xl" closeable>
            <div className="px-10 py-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Profile (read-only preview) */}
                    <div className="flex flex-col items-center justify-center w-full border border-gray-100 shadow-sm rounded-xl p-4">
                        <div className="relative w-40 h-40 mb-2">
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 pointer-events-none"></div>

                            <div className="relative z-10 w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                                {preview ? (
                                    <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center px-4">
                                        <div className="bg-white p-2 rounded-full shadow">
                                            <FontAwesomeIcon icon={faCamera} className="text-gray-500 w-6 h-6" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 font-medium">No Photo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">Current Profile Photo (Read-Only)</p>
                    </div>

                    {/* Form Section */}
                    <div className="col-span-2 space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className='col-span-full'>
                                    <InputWithLabel
                                        id="name"
                                        name="name"
                                        label="Full Name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>
                                <div>
                                    <InputWithLabel
                                        id="contact_number"
                                        name="contact_number"
                                        label="Phone Number"
                                        value={data.contact_number}
                                        onChange={(e) => setData("contact_number", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.contact_number} className="mt-1" />
                                </div>

                                {/* Rating field */}
                                <div>
                                    <InputWithLabel
                                        id="rating"
                                        name="rating"
                                        label="Rating (0–5)"
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={data.rating}
                                        onChange={(e) => setData("rating", e.target.value)}
                                    />
                                    <InputError message={errors.rating} className="mt-1" />
                                </div>

                                <div>
                                    <InputWithLabel
                                        id="address"
                                        name="address"
                                        label="Address"
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-1" />
                                </div>
                                <div>
                                    <InputWithLabel
                                        id="email"
                                        name="email"
                                        label="Email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Security Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputWithLabel
                                        id="password"
                                        name="password"
                                        label="New Password (optional)"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-1" />
                                </div>
                                <div>
                                    <InputWithLabel
                                        id="confirm_password"
                                        name="confirm_password"
                                        label="Confirm Password (if changing)"
                                        type="password"
                                        value={data.confirm_password}
                                        onChange={(e) => setData("confirm_password", e.target.value)}
                                    />
                                    <InputError message={errors.confirm_password} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
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
                                disabled={processing || !agent?.id}
                                className="px-4 py-2 rounded-md bg-primary text-white hover:bg-accent transition disabled:opacity-60"
                            >
                                {processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
