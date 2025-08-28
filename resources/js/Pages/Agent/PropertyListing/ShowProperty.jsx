import React, { useState } from "react";
import { router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";
import Dropdown from "@/Components/Dropdown.jsx";
import { BadgeCheck, Loader2, BadgeX } from "lucide-react"; // Added Loader2 icon for spinner

const ListingHeader = ({ onPublish, onUnpublish, pages, status, loading }) => (
    <div className="flex justify-between items-center bg-white  rounded-md mb-6">
        <Breadcrumbs pages={pages} />

        <Dropdown>
            <Dropdown.Trigger>
                <div
                    className="flex items-center bg-primary text-white gap-2 cursor-pointer hover:bg-accent px-3 py-2 rounded-lg transition"
                    role="button"
                >
                    <span className="text-sm font-medium text-white">{status}</span>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </Dropdown.Trigger>

            <Dropdown.Content>
                <button
                    onClick={onPublish}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full disabled:opacity-50"
                    aria-label="Publish Listing"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                    <span>Publish</span>
                </button>

                <button
                    onClick={onUnpublish}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full disabled:opacity-50"
                    aria-label="Unpublish Listing"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeX className="h-4 w-4" />}
                    <span>Unpublish</span>
                </button>
            </Dropdown.Content>
        </Dropdown>
    </div>
);

export default function ShowProperty({ propertyListing }) {
    const [loading, setLoading] = useState(false);

    const pages = [
        { name: 'My Listings', href: '/agents/my-listings', current: false },
        { name: propertyListing.property.title, href: '#', current: true },
    ];

    const handlePublish = () => {
        setLoading(true);
        router.patch(
            `/agents/my-listings/${propertyListing.property.id}`,
            { status: 'Published' },
            {
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleUnpublish = () => {
        setLoading(true);
        router.patch(
            `/agents/my-listings/${propertyListing.property.id}`,
            { status: 'Unpublished' },
            {
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <AgentLayout>
            <div className="    mx-auto px-4 sm:px-6 lg:px-8">
                <ListingHeader
                    onPublish={handlePublish}
                    onUnpublish={handleUnpublish}
                    pages={pages}
                    status={propertyListing.status}
                    loading={loading}
                />

                <SingleProperty property={propertyListing.property} />
            </div>
        </AgentLayout>
    );
}
