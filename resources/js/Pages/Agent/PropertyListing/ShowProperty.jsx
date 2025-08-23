import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Check } from "lucide-react";
import React from "react";
import {router} from "@inertiajs/react";
import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";
import {property} from "lodash";


const ListingHeader = ({  onPublish, pages }) => (

    <div className="flex justify-between items-center  bg-white">
        <Breadcrumbs pages={pages} />
        <button
            onClick={onPublish}
            className="flex items-center gap-2 font-bold text-sm px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-green-700 transition"
            aria-label="Publish Listing"
        >
            <span>Publish</span>
            <Check className="h-4 w-4" />

        </button>
    </div>
);

export default function ShowProperty({ propertyListing }) {

    const pages = [
        { name: 'My Listing', href: '/agents/my-listings', current: false },
        { name: `${propertyListing.property.title}`, href: '#', current: true },
    ];

    const handlePublish = () => {
        router.patch(`/agents/my-listings/${property.id}`);
    }

    return (
        <AgentLayout>

            <ListingHeader
                onPublish={handlePublish}
                pages={pages}
            />

            <SingleProperty property={propertyListing.property} />
        </AgentLayout>
    );
}
