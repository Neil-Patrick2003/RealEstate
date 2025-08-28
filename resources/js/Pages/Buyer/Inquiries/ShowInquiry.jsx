import React from 'react';
import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import NavBar from "@/Components/NavBar.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";
import {usePage} from "@inertiajs/react";
import BuyerLayout from "@/Layouts/BuyerLayout.jsx";

export default function ShowInquiry({property, deal}) {

    const pages = [
        { name: 'Inquiries', href: '/inquiries', current: false },
        { name: `${property.title}`, href: '#', current: true },
    ];

    const auth = usePage().props.auth.user;

    return (
        <BuyerLayout>
            <div className='mx-4 lg:mx-auto mt-20'>
                <Breadcrumb pages={pages} />
                <SingleProperty property={property} agents={property?.property_listing?.agents} auth={auth} broker={property?.property_listing?.broker} deal={deal}/>
            </div>
        </BuyerLayout>

    );
}
