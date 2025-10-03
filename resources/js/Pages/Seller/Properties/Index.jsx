// resources/js/Pages/Seller/Properties/Index.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { debounce } from "lodash";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Breadcrumbs from "@/Components/Breadcrumbs.jsx";
import SellerPropertiesFilterTab from "@/Components/tabs/SellerPropetiesFilterTab.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";

import {
    EllipsisVertical,
    Search as SearchIcon,
    Filter as FilterIcon,
    Trash2,
    Pencil,
    ExternalLink,
    UploadCloud,
    Eye,
    X,
} from "lucide-react";
import Dropdown from "@/Components/Dropdown";

const peso = (n) =>
    Number(n).toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
const cn = (...c) => c.filter(Boolean).join(" ");

const STATUS_MAP = {
    "to published": "bg-amber-50 text-amber-700 border border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border border-rose-200",
    sold: "bg-gray-50 text-gray-700 border border-gray-200",
    default: "bg-sky-50 text-sky-700 border border-sky-200",
};

function StatusBadge({ status }) {
    const key = String(status || "").toLowerCase();
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold",
                STATUS_MAP[key] || STATUS_MAP.default
            )}
        >
      {status || "—"}
    </span>
    );
}

function HeaderBar({ pages, onAdd }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <Breadcrumbs pages={pages} />
                <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
                <p className="text-sm text-gray-600">Manage your listings, publishing, and updates.</p>
            </div>
            <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 bg-primary text-white px-4 md:px-5 py-2 rounded-md text-sm md:text-base font-medium hover:bg-accent shadow-sm transition"
            >
                <UploadCloud className="h-4 w-4" />
                Add Property
            </button>
        </div>
    );
}

function Toolbar({
                     selectedStatus,
                     setSelectedStatus,
                     searchTerm,
                     setSearchTerm,
                     selectedItemsPerPage,
                     onItemsPerPage,
                     counts,
                     onClearSearch,
                 }) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Status Tabs */}
                <div className="w-full lg:w-auto overflow-x-auto">
                    <SellerPropertiesFilterTab
                        count={counts}
                        selectedStatus={selectedStatus}
                        setSelectedStatus={setSelectedStatus}
                        searchTerm={searchTerm}
                        selectedItemsPerPage={selectedItemsPerPage}
                    />
                </div>

                <div className="flex-1" />

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search properties…"
                        className="w-full h-10 pl-9 pr-9 rounded-md border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-200 focus:outline-none"
                    />
                    {searchTerm && (
                        <button
                            onClick={onClearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Per-page */}
                <div className="flex items-center gap-2">
                    <FilterIcon className="h-4 w-4 text-gray-500" />
                    <label htmlFor="perPage" className="text-sm text-gray-600">
                        Items/page
                    </label>
                    <select
                        id="perPage"
                        value={selectedItemsPerPage}
                        onChange={(e) => onItemsPerPage(Number(e.target.value))}
                        className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white"
                    >
                        {[5, 10, 15, 20, 30].map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

function BulkBar({ selectedCount, onPublish, onUnpublish, onDelete, disable }) {
    if (selectedCount === 0) return null;
    return (
        <div className="sticky top-14 z-10 bg-white border rounded-xl p-3 flex flex-wrap items-center gap-2 shadow-sm">
      <span className="text-sm text-gray-700">
        {selectedCount} selected
      </span>
            <div className="flex items-center gap-2 ml-auto">
                <button
                    onClick={onPublish}
                    disabled={disable}
                    className="px-3 py-1.5 rounded-md text-sm border bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                    Publish
                </button>
                <button
                    onClick={onUnpublish}
                    disabled={disable}
                    className="px-3 py-1.5 rounded-md text-sm border bg-gray-800 text-white hover:bg-black disabled:opacity-50"
                >
                    Unpublish
                </button>
                <button
                    onClick={onDelete}
                    disabled={disable}
                    className="px-3 py-1.5 rounded-md text-sm border bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function Index({
                                  properties,
                                  search = "",
                                  page = 1,
                                  itemsPerPage = 10,
                                  status = "",
                                  all,
                                  assigned,
                                  rejected,
                                  unassigned,
                                  published,
                              }) {
    // filters
    const [searchTerm, setSearchTerm] = useState(search || "");
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(Number(itemsPerPage));
    const [selectedStatus, setSelectedStatus] = useState(status || "All");

    // selection
    const [selected, setSelected] = useState({}); // { [id]: true }
    const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

    // delete dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // debounced fetch
    const debouncedFilter = useRef(
        debounce((params) => {
            router.get("/seller/properties", params, { preserveState: true, replace: true });
        }, 450)
    ).current;

    useEffect(() => () => debouncedFilter.cancel(), []);

    // whenever filters change (status / search / per page)
    useEffect(() => {
        debouncedFilter({
            page,
            items_per_page: selectedItemsPerPage,
            status: selectedStatus,
            search: searchTerm,
        });
    }, [selectedItemsPerPage, selectedStatus, searchTerm]); // eslint-disable-line

    const pages = [{ name: "Properties", href: "/seller/properties", current: true }];

    const counts = [all, published, unassigned, assigned, rejected];

    const toggleAll = (checked) => {
        const map = {};
        (properties?.data || []).forEach((p) => {
            map[p.id] = checked;
        });
        setSelected(map);
    };
    const toggleOne = (id, checked) => setSelected((s) => ({ ...s, [id]: checked }));

    const openDelete = (id) => {
        setDeletingId(id);
        setOpenDeleteDialog(true);
    };

    const doDelete = () => {
        const ids = deletingId ? [deletingId] : selectedIds;
        if (!ids.length) return;
        setLoading(true);
        router.post(
            "/seller/properties/bulk-delete",
            { ids }, // create this route; or loop delete
            {
                onFinish: () => {
                    setOpenDeleteDialog(false);
                    setDeletingId(null);
                    setLoading(false);
                    setSelected({});
                },
            }
        );
    };

    const bulkPublish = () => {
        if (!selectedIds.length) return;
        setLoading(true);
        router.post(
            "/seller/properties/bulk-status",
            { ids: selectedIds, status: "Published" },
            {
                onFinish: () => {
                    setLoading(false);
                    setSelected({});
                },
            }
        );
    };
    const bulkUnpublish = () => {
        if (!selectedIds.length) return;
        setLoading(true);
        router.post(
            "/seller/properties/bulk-status",
            { ids: selectedIds, status: "To Published" },
            {
                onFinish: () => {
                    setLoading(false);
                    setSelected({});
                },
            }
        );
    };

    const onClearSearch = () => setSearchTerm("");

    return (
        <AuthenticatedLayout>
            {/* Delete dialog (single or bulk) */}
            <ConfirmDialog
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                title="Delete Property"
                description="Are you sure you want to delete the selected property/properties? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={doDelete}
                loading={loading}
            />

            <div className="px-6 space-y-6">
                {/* Header */}
                <HeaderBar pages={pages} onAdd={() => router.visit("/post-property")} />

                {/* Filters / search */}
                <Toolbar
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedItemsPerPage={selectedItemsPerPage}
                    onItemsPerPage={(v) => setSelectedItemsPerPage(v)}
                    counts={counts}
                    onClearSearch={onClearSearch}
                />

                {/* Bulk actions */}
                <BulkBar
                    selectedCount={selectedIds.length}
                    onPublish={bulkPublish}
                    onUnpublish={bulkUnpublish}
                    onDelete={() => {
                        setDeletingId(null); // means bulk
                        setOpenDeleteDialog(true);
                    }}
                    disable={loading}
                />

                {/* Table */}
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-50 sticky top-14 z-[5]">
                        <tr>
                            <th className="p-3 text-center w-10">
                                <input
                                    type="checkbox"
                                    aria-label="Select all"
                                    className="rounded border-gray-400"
                                    onChange={(e) => toggleAll(e.target.checked)}
                                    checked={
                                        (properties?.data || []).length > 0 &&
                                        selectedIds.length === (properties?.data || []).length
                                    }
                                    indeterminate={
                                        selectedIds.length > 0 &&
                                        selectedIds.length < (properties?.data || []).length
                                    }
                                />
                            </th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">
                                Size <span className="lowercase">(m²)</span>
                            </th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dashed">
                        {(properties?.data || []).length > 0 ? (
                            properties.data.map((p) => {
                                const size =
                                    p.property_type === "Land" ? p.lot_area : p.floor_area;

                                return (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-3 text-center w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-400"
                                                checked={!!selected[p.id]}
                                                onChange={(e) => toggleOne(p.id, e.target.checked)}
                                                aria-label={`Select ${p.title}`}
                                            />
                                        </td>

                                        {/* Title + address + image */}
                                        <td className="p-3 min-w-[260px]">
                                            <div className="flex items-center py-2 gap-3">
                                                <img
                                                    src={p.image_url ? `/storage/${p.image_url}` : "/placeholder.png"}
                                                    alt={p.title || "Property"}
                                                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md ring-1 ring-gray-200 bg-white"
                                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{p.title || "—"}</p>
                                                    <p className="text-xs md:text-sm text-gray-500 truncate">{p.address || "—"}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-3 whitespace-nowrap">
                                            {p.property_type || "—"}, {p.sub_type || "—"}
                                        </td>

                                        {/* Description (clean HTML) */}
                                        <td className="p-3">
                                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px] md:max-w-[320px] text-gray-600">
                                                {(p.description || "").replace(/<[^>]+>/g, "").slice(0, 120)}
                                                {p.description && p.description.length > 120 ? "…" : ""}
                                            </div>
                                        </td>

                                        <td className="p-3 whitespace-nowrap">{peso(p.price || 0)}</td>

                                        <td className="p-3">
                                            <StatusBadge status={p.status} />
                                        </td>

                                        <td className="p-3 whitespace-nowrap">{size ? `${size} m²` : "—"}</td>

                                        <td className="p-3 text-right">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <div className="p-2 w-9 rounded-full hover:bg-gray-100 cursor-pointer inline-flex items-center justify-center">
                                                        <EllipsisVertical size={18} className="text-gray-600" />
                                                    </div>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content width="48">
                                                    <ul className="divide-y divide-gray-100 text-sm">
                                                        <Link href={`/seller/properties/${p.id}`}>
                                                            <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                                                                <Eye className="h-4 w-4" /> View
                                                            </li>
                                                        </Link>
                                                        <Link href={`/seller/properties/${p.id}/edit`}>
                                                            <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                                                                <Pencil className="h-4 w-4" /> Edit
                                                            </li>
                                                        </Link>
                                                        <li
                                                            onClick={() => openDelete(p.id)}
                                                            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Delete
                                                        </li>
                                                    </ul>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-10">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-3">
                                        <ExternalLink className="text-gray-500" />
                                    </div>
                                    <p className="text-gray-700 font-medium">No properties found</p>
                                    <p className="text-gray-500 text-sm">
                                        Try adjusting your filters or add a new property.
                                    </p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* Footer: pagination + per-page (kept, styled) */}
                    <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 rounded-b-xl p-4 gap-4">
                        <div className="text-sm text-gray-600">
                            Showing{" "}
                            <span className="font-medium">
                {properties.from}–{properties.to}
              </span>{" "}
                            of <span className="font-medium">{properties.total}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end" aria-label="Pagination navigation">
                            {properties.links.map((link, i) => {
                                const query = new URLSearchParams({
                                    search: searchTerm,
                                    status: selectedStatus,
                                    items_per_page: selectedItemsPerPage,
                                });
                                const href = link.url ? `${link.url}&${query.toString()}` : null;

                                return link.url ? (
                                    <Link
                                        key={i}
                                        href={href}
                                        className={cn(
                                            "px-3 md:px-4 py-2 text-sm md:text-base rounded-md border transition",
                                            link.active
                                                ? "bg-primary text-white font-semibold border-primary"
                                                : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        aria-current={link.active ? "page" : undefined}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-3 md:px-4 py-2 text-sm md:text-base text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        aria-disabled="true"
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
