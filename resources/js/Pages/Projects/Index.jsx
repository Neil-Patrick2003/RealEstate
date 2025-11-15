import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function Index({ projects }) {
    const rows = projects?.data ?? [];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Head title="Explore Projects" />
            <h1 className="text-2xl font-bold mb-6">Explore Projects</h1>

            {rows.length === 0 ? (
                <p className="text-gray-600">No active projects found.</p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rows.map((p) => (
                        <div key={p.id} className="rounded-lg border bg-white shadow-sm p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold">{p.name}</h2>
                                <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700">
                  {p.type}
                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{p.address}</p>

                            {/* Inventory summary */}
                            <div className="text-sm border-t pt-3 mt-3 space-y-1">
                                {Array.isArray(p.inventory_pools) && p.inventory_pools.length > 0 ? (
                                    <>
                                        {p.inventory_pools.slice(0, 3).map((pool) => {
                                            const available = (pool.total ?? 0) - (pool.held ?? 0) - (pool.reserved ?? 0) - (pool.sold ?? 0);
                                            return (
                                                <div key={pool.id} className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {pool.block?.block_code} · {pool.house_type?.name}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            Total {pool.total} · Avail {available}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-500">Base</div>
                                                        <div className="font-semibold">
                                                            ₱{Number(pool.house_type?.base_price ?? 0).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {p.inventory_pools.length > 3 && (
                                            <div className="text-xs text-gray-500">+{p.inventory_pools.length - 3} more…</div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-gray-500">No inventory yet.</div>
                                )}
                            </div>

                            {/* Example CTASection (optional) */}
                            <div className="mt-4">
                                <Link
                                    // href={route('public.projects.index') + `?project=${p.id}`} // replace with your “show” route if you have one
                                    className="inline-block text-sm px-3 py-2 rounded bg-gray-900 text-white hover:bg-black"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center gap-2 mt-6">
                {projects.prev_page_url ? (
                    <Link
                        href={projects.prev_page_url}
                        className="px-3 py-2 rounded border hover:bg-gray-50"
                    >
                        ← Prev
                    </Link>
                ) : (
                    <span className="px-3 py-2 rounded border text-gray-400">← Prev</span>
                )}
                <span className="text-sm text-gray-600">
          Page {projects.current_page} of {projects.last_page}
        </span>
                {projects.next_page_url ? (
                    <Link
                        href={projects.next_page_url}
                        className="px-3 py-2 rounded border hover:bg-gray-50"
                    >
                        Next →
                    </Link>
                ) : (
                    <span className="px-3 py-2 rounded border text-gray-400">Next →</span>
                )}
            </div>
        </div>
    );
}

