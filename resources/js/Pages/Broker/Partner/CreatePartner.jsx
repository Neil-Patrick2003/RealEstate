import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import {useForm} from "@inertiajs/react";
import InputWithLabel from "@/Components/InputWithLabel.jsx";
import InputError from "@/Components/InputError.jsx";
import React from "react";

export default function CreatePartner() {

    return (
        <BrokerLayout>
            Create Partner Developer

            <div className='grid grid-cols-1 md:grid-cols-2'>
                <div>
                    <InputWithLabel
                        id="name"
                        name="name"
                        label="Company Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>
                <div>
                    <InputWithLabel
                        id="trade_name"
                        name="trade_name"
                        label="Trade Name"
                        value={data.name}
                        onChange={(e) => setData('trade_name', e.target.value)}
                        required
                    />
                    <InputError message={errors.trade_name} className="mt-1" />
                </div>
                <div>
                    <InputWithLabel
                        id="registration_number"
                        name="registration_number"
                        label="Registration Number"
                        value={data.name}
                        onChange={(e) => setData('registration_number', e.target.value)}
                        required
                    />
                    <InputError message={errors.registration_number} className="mt-1" />
                </div>
                <div>
                    <InputWithLabel
                        id="license_number"
                        name="license_number"
                        label="License Number"
                        value={data.license_number}
                        onChange={(e) => setData('license_number', e.target.value)}
                        required
                    />
                    <InputError message={errors.license_number} className="mt-1" />
                </div>
                <div>
                    <InputWithLabel
                        id="head_office_address"
                        name="head_office_address"
                        label="Head Office Address"
                        value={data.head_office_address}
                        onChange={(e) => setData('head_office_address', e.target.value)}
                        required
                    />
                    <InputError message={errors.head_office_address} className="mt-1" />
                </div>
                <div>
                    <InputWithLabel
                        id="website_url"
                        name="website_url"
                        label="Facebook Url (optional)"
                        value={data.website_url}
                        onChange={(e) => setData('website_url', e.target.value)}
                    />
                    <InputError message={errors.website_url} className="mt-1" />
                </div>
                <div>
                    <InputWithLabel
                        id="facebook_url"
                        name="facebook_url"
                        label="Website Url (optional)"
                        value={data.facebook_url}
                        onChange={(e) => setData('facebook_url', e.target.value)}
                    />
                    <InputError message={errors.facebook_url} className="mt-1" />
                </div>

            </div>

        </BrokerLayout>
    );
}
