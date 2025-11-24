import React from 'react';
import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import NavBar from "@/Components/NavBar.jsx";
import Breadcrumb from "@/Components/Breadcrumbs.jsx";
import {usePage} from "@inertiajs/react";
import BackButton from "@/Components/BackButton.jsx";

export default function ShowProperty({property, deal, allAgents}) {

    const pages = [
        { name: 'All Properties', href: '/all-properties', current: false },
        { name: `${property.title}`, href: '#', current: true },
    ];

    const auth = usePage().props.auth.user;

    return (
        <div>
            <NavBar/>
            <div className='bg-primary-600 h-full max-w-7xl pt-20   mx-4 lg:mx-auto'>
                <BackButton color='white'/>
                <SingleProperty property={property} agents={property?.property_listing?.agents} auth={auth} broker={property?.property_listing?.broker} deal={deal} allAgents={allAgents}/>
            </div>
        </div>

    );
}
