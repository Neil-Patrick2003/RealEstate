import React from 'react';
import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import NavBar from "@/Components/NavBar.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";
import {usePage} from "@inertiajs/react";

export default function ShowProperty({property}) {

    const pages = [
        { name: 'All Properties', href: '/all-properties', current: false },
        { name: `${property.title}`, href: '#', current: true },
    ];

    const auth = usePage().props.auth.user;

    return (
        <div>
            <NavBar/>
            <div className='max-w-7xl mx-4 lg:mx-auto mt-20'>
                <Breadcrumb pages={pages} />
                <SingleProperty property={property} agents={property.property_listing.agents} auth={auth}/>
            </div>
        </div>

    );
}
