// resources/js/Pages/Seller/Properties/Index.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { debounce } from "lodash";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SellerPropertiesFilterTab from "@/Components/tabs/SellerPropetiesFilterTab.jsx";
import ConfirmDialog from "@/Components/modal/ConfirmDialog.jsx";
import {
    EllipsisVertical,
    Search as SearchIcon,
    Trash2,
    Pencil,
    ExternalLink,
    UploadCloud,
    Eye,
    X,
} from "lucide-react";
import Dropdown from "@/Components/Dropdown";

const peso = (n) =>
    Number(n || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    });
const cn = (...c) => c.filter(Boolean).join(" ");

const STATUS_MAP = {
    "to published": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    published: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    sold: "bg-gray-50 text-gray-700 ring-1 ring-gray-200",
    default: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
};

function StatusBadge({ status }) {
    const key = String(status || "").toLowerCase();
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                STATUS_MAP[key] || STATUS_MAP.default
            )}
        >
      {status || "—"}
    </span>
    );
}

function HeaderBar({ onAdd }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Properties</h1>
                <p className="text-sm text-gray-600">Manage your listings, publishing, and updates.</p>
            </div>
            <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
                 }) {
    const inputRef = useRef(null);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
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
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search properties…"
                        className="w-full h-10 rounded-md border border-gray-300 bg-white pl-9 pr-9 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                inputRef.current?.focus();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Per-page */}
                <div className="flex items-center gap-2">
                    <label htmlFor="perPage" className="text-sm text-gray-600">
                        Rows
                    </label>
                    <select
                        id="perPage"
                        value={selectedItemsPerPage}
                        onChange={(e) => onItemsPerPage(Number(e.target.value))}
                        className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
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
        <div className="sticky top-14 z-10 rounded-xl border bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-700">{selectedCount} selected</span>
                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={onPublish}
                        disabled={disable}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                        Publish
                    </button>
                    <button
                        onClick={onUnpublish}
                        disabled={disable}
                        className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-black disabled:opacity-50"
                    >
                        Unpublish
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={disable}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-500 disabled:opacity-50"
                    >
                        Delete
                    </button>
                </div>
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

    useEffect(() => () => debouncedFilter.cancel(), []); // cleanup

    // whenever filters change (status / search / per page)
    useEffect(() => {
        debouncedFilter({
            page,
            items_per_page: selectedItemsPerPage,
            status: selectedStatus,
            search: searchTerm,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemsPerPage, selectedStatus, searchTerm]);

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
            { ids },
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

    // indeterminate checkbox handling
    const allCount = (properties?.data || []).length;
    const allChecked = allCount > 0 && selectedIds.length === allCount;
    const someChecked = selectedIds.length > 0 && selectedIds.length < allCount;
    const masterRef = useRef(null);
    useEffect(() => {
        if (masterRef.current) masterRef.current.indeterminate = someChecked;
    }, [someChecked]);

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

            <div className="space-y-6 pt-10">
                {/* Header */}
                <HeaderBar onAdd={() => router.visit("/post-property")} />

                {/* Filters / search */}
                <Toolbar
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedItemsPerPage={selectedItemsPerPage}
                    onItemsPerPage={(v) => setSelectedItemsPerPage(v)}
                    counts={counts}
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

                {/* Table Card */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-gray-700">
                            <thead className=" rounded-t bg-gray-200 ">
                            <tr className="border-b border-gray-200">
                                <th className="p-3 text-center w-10">
                                    <input
                                        ref={masterRef}
                                        type="checkbox"
                                        aria-label="Select all"
                                        className="h-4 w-4 rounded border-gray-400"
                                        onChange={(e) => toggleAll(e.target.checked)}
                                        checked={allChecked}
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
                            <tbody className="[&>tr:hover]:bg-gray-50 divide-y divide-gray-100">
                            {(properties?.data || []).length > 0 ? (
                                properties.data.map((p) => {
                                    const size = p.property_type === "Land" ? p.lot_area : p.floor_area;

                                    return (
                                        <tr key={p.id} className="align-middle">
                                            <td className="p-3 text-center w-10">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-400"
                                                    checked={!!selected[p.id]}
                                                    onChange={(e) => toggleOne(p.id, e.target.checked)}
                                                    aria-label={`Select ${p.title || "property"}`}
                                                />
                                            </td>

                                            {/* Title + address + image */}
                                            <td className="p-3 min-w-[260px]">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={p.image_url ? `/storage/${p.image_url}` : "/placeholder.png"}
                                                        alt={p.title || "Property"}
                                                        className="h-14 w-14 md:h-16 md:w-16 rounded-md bg-white object-cover ring-1 ring-gray-200"
                                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-gray-900">
                                                            {p.title || "—"}
                                                        </p>
                                                        <p className="truncate text-xs md:text-sm text-gray-500">
                                                            {p.address || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-3 whitespace-nowrap">
                                                {p.property_type || "—"}
                                                {p.sub_type ? `, ${p.sub_type}` : ""}
                                            </td>

                                            {/* Description (clean HTML) */}
                                            <td className="p-3">
                                                <div className="max-w-[320px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-600">
                                                    {(p.description || "").replace(/<[^>]+>/g, "")}
                                                </div>
                                            </td>

                                            <td className="p-3 whitespace-nowrap">{peso(p.price)}</td>

                                            <td className="p-3">
                                                <StatusBadge status={p.status} />
                                            </td>

                                            <td className="p-3 whitespace-nowrap">{size ? `${size} m²` : "—"}</td>

                                            <td className="p-3 text-right space-x-2">
                                                <Link
                                                    href={`/seller/properties/${p.id}`}
                                                    className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100"
                                                    aria-label="View"
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>

                                                <Link
                                                    href={`/seller/properties/${p.id}/edit`}
                                                    className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100"
                                                    aria-label="Edit"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>

                                                <button
                                                    onClick={() => openDelete(p.id)}
                                                    className="inline-flex items-center justify-center rounded-full p-2 text-rose-600 hover:bg-rose-50"
                                                    aria-label="Delete"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center">
                                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                            <ExternalLink className="text-gray-500" />
                                        </div>
                                        <p className="font-medium text-gray-800">No properties found</p>
                                        <p className="text-sm text-gray-500">
                                            Try adjusting your filters or add a new property.
                                        </p>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer: pagination */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 p-4 md:flex-row">
                        <div className="text-sm text-gray-600">
                            Showing{" "}
                            <span className="font-medium">
                {properties.from}–{properties.to}
              </span>{" "}
                            of <span className="font-medium">{properties.total}</span>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2" aria-label="Pagination navigation">
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
                                            "rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
                                            link.active
                                                ? "border-primary bg-primary font-semibold text-white"
                                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        aria-current={link.active ? "page" : undefined}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="cursor-not-allowed rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400"
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
