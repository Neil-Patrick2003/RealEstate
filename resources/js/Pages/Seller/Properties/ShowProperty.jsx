import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React from 'react';

import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";

const ShowProperty = ({ property }) => {
    const imageBasePath = '/storage/';


    const pages = [
        { name: 'Properties', href: '/seller/properties', current: false },
        { name: `${property.title}`, href: `/seller/properties/${property.id}`, current: true },
    ];


    return (
        <AuthenticatedLayout>
            <div className='pt-10'>
                <Breadcrumbs pages={pages} />
                <SingleProperty property={property} />
            </div>

        </AuthenticatedLayout>
    );
};

export default ShowProperty;
