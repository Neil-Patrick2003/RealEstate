import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal.jsx";
import InputError from "@/Components/InputError.jsx";
import InputWithLabel from "@/Components/InputWithLabel.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export default function AddAgentModal({ openAddAgent, setOpenAddAgent }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        name: '',
        email: '',
        contact_number: '',
        address: '',
        password: '',
        confirm_password: '',
        image_url: ''
    });

    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setData('image_url', file);
        }
    };

    const closeModal = () => {
        setOpenAddAgent(false);
        reset();
        setPreview(null);
    };

    const submit = (e) => {
        e.preventDefault();
        post('/broker/agents/create', {
            onSuccess: closeModal,
            forceFormData: true
        });
    };

    return (
        <Modal show={openAddAgent} onClose={closeModal} maxWidth="4xl" closeable>
            <div className="px-10 py-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Create Agent Account</h2>

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Profile Upload */}
                    <div className="flex flex-col border rounded-xl border-gray-100 shadow-sm   items-center justify-center w-full">
                        <div className="relative w-40  h-40 mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 animate-spin-slow pointer-events-none"></div>

                            <label
                                htmlFor="profile_upload"
                                className="relative z-10 w-full h-full rounded-full overflow-hidden cursor-pointer group bg-gray-100 shadow-md flex items-center justify-center"
                            >
                                {!preview ? (
                                    <div className="flex flex-col items-center justify-center text-center px-4">
                                        <div className="bg-white p-2 rounded-full shadow">
                                            <FontAwesomeIcon icon={faCamera} className="text-gray-500 w-6 h-6" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 font-medium">Upload Photo</p>
                                    </div>
                                ) : (
                                    <>
                                        <img
                                            src={preview}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <FontAwesomeIcon icon={faCamera} className="text-white w-5 h-5 mb-1" />
                                            <span className="text-xs text-white">Change Photo</span>
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

                        <p className="text-xs text-gray-500 text-center">JPG, PNG, GIF – Max 3MB</p>
                        <InputError message={errors.image_url} className="mt-2" />
                    </div>

                    {/* Form Section */}
                    <div className="col-span-2 space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputWithLabel
                                        id="name"
                                        name="name"
                                        label="Full Name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
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
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.contact_number} className="mt-1" />
                                </div>
                                <div>
                                    <InputWithLabel
                                        id="address"
                                        name="address"
                                        label="Address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
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
                                        onChange={(e) => setData('email', e.target.value)}
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
                                        label="Password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-1" />
                                </div>
                                <div>
                                    <InputWithLabel
                                        id="confirm_password"
                                        name="confirm_password"
                                        label="Confirm Password"
                                        type="password"
                                        value={data.confirm_password}
                                        onChange={(e) => setData('confirm_password', e.target.value)}
                                        required
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
                                disabled={processing}
                                className="px-4 py-2 rounded-md bg-primary text-white hover:bg-accent transition"
                            >
                                {processing ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
