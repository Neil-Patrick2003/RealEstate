import Modal from "@/Components/Modal.jsx";
import { useForm } from "@inertiajs/react";
import InputWithLabel from "@/Components/InputWithLabel.jsx";
import InputError from "@/Components/InputError.jsx";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";

export default function AddPartner({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        trade_name: '',
        registration_number: '',
        license_number: '',
        head_office_address: '',
        company_logo: '',
        website_url: '',
        facebook_url: '',
    });

    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setData('company_logo', file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/broker/partners/create', {
            onSuccess: () => {
                reset();
                onClose();
            },
            forceFormData: true
        });
    };

    return (
        <Modal show={show} onClose={onClose} closeable maxWidth="4xl">
            <form onSubmit={submit} className="p-6 space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Add Partner Developer</h2>
                    <p className="text-sm text-gray-500">Fill out the developer's company profile and contact details.</p>
                </div>

                {/* Logo Upload + Company Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center justify-center border rounded-xl border-gray-200 shadow-sm p-6">
                        <div className="relative w-40 h-40 mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 animate-spin-slow pointer-events-none"></div>

                            <label
                                htmlFor="profile_upload"
                                aria-label="Upload company logo"
                                className="relative z-10 w-full h-full rounded-full overflow-hidden cursor-pointer group bg-gray-100 shadow-md flex items-center justify-center"
                            >
                                {!preview ? (
                                    <div className="flex flex-col items-center justify-center text-center px-4">
                                        <div className="bg-white p-2 rounded-full shadow">
                                            <FontAwesomeIcon icon={faCamera} className="text-gray-500 w-6 h-6" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 font-medium">Upload Logo</p>
                                    </div>
                                ) : (
                                    <>
                                        <img
                                            src={preview}
                                            alt="Company Logo Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <FontAwesomeIcon icon={faCamera} className="text-white w-5 h-5 mb-1" />
                                            <span className="text-xs text-white">Change Logo</span>
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
                        <p className="text-xs text-gray-500 text-center">JPG, PNG, or GIF – Max 3MB</p>
                        <InputError message={errors.company_logo} className="mt-2" />
                    </div>

                    {/* Company Information */}
                    <div className="col-span-1 md:col-span-2 space-y-5">
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-1">Company Info</h3>

                        <InputWithLabel
                            id="name"
                            name="name"
                            label="Company Name *"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />

                        <InputWithLabel
                            id="trade_name"
                            name="trade_name"
                            label="Trade Name"
                            value={data.trade_name}
                            onChange={(e) => setData('trade_name', e.target.value)}
                        />
                        <InputError message={errors.trade_name} className="mt-1" />

                        <InputWithLabel
                            id="registration_number"
                            name="registration_number"
                            label="Business Registration Number *"
                            value={data.registration_number}
                            onChange={(e) => setData('registration_number', e.target.value)}
                            required
                        />
                        <InputError message={errors.registration_number} className="mt-1" />

                        <InputWithLabel
                            id="license_number"
                            name="license_number"
                            label="DHSUD License Number *"
                            value={data.license_number}
                            onChange={(e) => setData('license_number', e.target.value)}
                            required
                        />
                        <InputError message={errors.license_number} className="mt-1" />
                    </div>
                </div>

                {/* Contact and Online Info */}
                <div className="flex flex-col gap-6">
                    <div className="space-y-5">
                        <h3 className="text-md font-semibold text-gray-700 border-b pb-1">Contact Info</h3>

                        <InputWithLabel
                            id="head_office_address"
                            name="head_office_address"
                            label="Head Office Address *"
                            value={data.head_office_address}
                            onChange={(e) => setData('head_office_address', e.target.value)}
                            required
                        />
                        <InputError message={errors.head_office_address} className="mt-1" />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full">
                            <InputWithLabel
                                id="website_url"
                                name="website_url"
                                label="Website URL"
                                value={data.website_url}
                                onChange={(e) => setData('website_url', e.target.value)}
                                placeholder="https://developer.com"
                            />
                            <InputError message={errors.website_url} className="mt-1" />
                        </div>

                        <div className="w-full">
                            <InputWithLabel
                                id="facebook_url"
                                name="facebook_url"
                                label="Facebook Page"
                                value={data.facebook_url}
                                onChange={(e) => setData('facebook_url', e.target.value)}
                                placeholder="https://facebook.com/yourpage"
                            />
                            <InputError message={errors.facebook_url} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <button onClick={onClose} className="px-6 py-2 bg-green-100  rounded-md text-primaryrounded-md mr-4 hover:bg-green-400 transition">
                        Close
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-accent transition disabled:opacity-50"
                    >
                        {processing ? "Saving..." : "Save Partner"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
