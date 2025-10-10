// resources/js/Pages/Agents/ShowProperty.jsx
import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";
import Dropdown from "@/Components/Dropdown.jsx";
import { BadgeCheck, Loader2, BadgeX, EllipsisVertical } from "lucide-react";

const statusChip = (s) => {
    const k = String(s || "").toLowerCase();
    if (k === "published")
        return "bg-primary/10 text-primary border border-primary/20";
    if (k === "unpublished")
        return "bg-gray-100 text-gray-700 border border-gray-200";
    if (k === "assigned")
        return "bg-secondary/10 text-secondary border border-secondary/20";
    return "bg-gray-100 text-gray-600 border";
};

const ListingHeader = ({
                           onPublish,
                           onUnpublish,
                           pages,
                           status,
                           loading,
                           confirmBefore = false,
                       }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="min-w-0">
            <Breadcrumbs pages={pages} />
            <div className="mt-2">
                <span
                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusChip(
                        status
                    )}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {status || "—"}
                  </span>
            </div>
        </div>

        <Dropdown>
            <Dropdown.Trigger>
                <button
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-3 py-2 text-sm font-medium hover:bg-accent transition focus:outline-none focus:ring-2 focus:ring-primary/30"
                    type="button"
                    aria-haspopup="menu"
                >
                    Manage
                    <EllipsisVertical className="h-4 w-4" />
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content align="end" width="56">
                <button
                    onClick={onPublish}
                    disabled={loading}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4 text-primary" />}
                    Publish
                </button>
                <button
                    onClick={onUnpublish}
                    disabled={loading}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeX className="h-4 w-4 text-gray-600" />}
                    Unpublish
                </button>
            </Dropdown.Content>
        </Dropdown>
    </div>
);

export default function ShowProperty({ propertyListing }) {
    const [loading, setLoading] = useState(false);

    const pages = useMemo(
        () => [
            { name: "My Listings", href: "/agents/my-listings", current: false },
            { name: propertyListing?.property?.title || "Listing", href: "#", current: true },
        ],
        [propertyListing?.property?.title]
    );

    const patchStatus = (next) => {
        setLoading(true);
        router.patch(
            `/agents/my-listings/${propertyListing.property.id}`,
            { status: next },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    const handlePublish = () => patchStatus("Published");
    const handleUnpublish = () => patchStatus("Unpublished");

    return (
        <AgentLayout>
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <ListingHeader
                    onPublish={handlePublish}
                    onUnpublish={handleUnpublish}
                    pages={pages}
                    status={propertyListing.status}
                    loading={loading}
                />

                {/* Content shell with subtle border to match theme */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <SingleProperty property={propertyListing.property} />
                </div>
            </div>
        </AgentLayout>
    );
}
