// resources/js/Pages/Trippings/Calendar.jsx
import React, { useMemo, useState, useMemo as useM } from "react";
import { Head } from "@inertiajs/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AgentLayout from "@/Layouts/AgentLayout.jsx";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function Calendar({ events = [], agents = [] }) {
    const [agentFilter, setAgentFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        return events.filter((e) => {
            const aOk =
                agentFilter === "all" ||
                String(e.extendedProps?.agent_id ?? "") === String(agentFilter);
            const sOk =
                statusFilter === "all" ||
                (e.extendedProps?.status ?? "").toLowerCase() ===
                statusFilter.toLowerCase();
            return aOk && sOk;
        });
    }, [events, agentFilter, statusFilter]);

    // Compute a compact legend of agents that actually appear in the filtered result
    const legendAgents = useMemo(() => {
        const ids = new Set(filtered.map((e) => e.extendedProps?.agent_id).filter(Boolean));
        return agents.filter((a) => ids.has(a.id));
    }, [filtered, agents]);

    // Custom event renderer: avatar + property title + time + status chip
    const renderEvent = (info) => {
        const ex = info.event.extendedProps || {};
        return (
            <div className="flex items-center gap-2 px-1 py-1">
                {ex.agent_photo ? (
                    <img
                        src={ex.agent_photo}
                        alt={ex.agent}
                        className="h-4 w-4 rounded-full object-cover ring-1 ring-white/60"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-4 w-4 rounded-full bg-white/30 ring-1 ring-white/60" />
                )}
                <div className="min-w-0">
                    <div className="truncate text-[11px] leading-tight font-semibold">
                        {info.event.title}
                    </div>
                    <div className="truncate text-[10px] leading-tight opacity-90">
                        {info.timeText} • {ex.agent ?? "Unassigned"}
                    </div>
                </div>
                {ex.status && (
                    <span
                        className={cn(
                            "ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ring-1",
                            ex.status === "completed" && "bg-emerald-50 text-emerald-700 ring-emerald-200",
                            ex.status === "scheduled" && "bg-sky-50 text-sky-700 ring-sky-200",
                            ex.status === "canceled" && "bg-rose-50 text-rose-700 ring-rose-200",
                            ex.status === "missed" && "bg-amber-50 text-amber-700 ring-amber-200"
                        )}
                    >
            {String(ex.status).charAt(0).toUpperCase() + String(ex.status).slice(1)}
          </span>
                )}
            </div>
        );
    };

    return (
        <AgentLayout>
            <Head title="Agent Tripping Calendar" />
            {/* Page background */}
            <div className="min-h-screen bg-[radial-gradient(60rem_40rem_at_20%_-10%,#e0f2fe_0%,transparent_40%),radial-gradient(60rem_40rem_at_120%_10%,#fce7f3_0%,transparent_40%)] p-6">
                <div className="mx-auto max-w-7xl space-y-4">
                    {/* Header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                Agent Tripping Calendar
                            </h1>
                            <p className="text-sm text-gray-500">
                                See all trippings by date, filter by agent and status.
                            </p>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl bg-white/80 shadow-sm ring-1 ring-gray-100 backdrop-blur">
                        {/* Toolbar */}
                        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-gray-100 bg-white/80 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={agentFilter}
                                    onChange={(e) => setAgentFilter(e.target.value)}
                                    className="rounded-xl border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:ring-0"
                                >
                                    <option value="all">All Agents</option>
                                    {agents.map((a) => (
                                        <option value={a.id} key={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-xl border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:ring-0"
                                >
                                    <option value="all">All Status</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="canceled">Canceled</option>
                                    <option value="missed">Missed</option>
                                </select>

                                {(agentFilter !== "all" || statusFilter !== "all") && (
                                    <button
                                        onClick={() => {
                                            setAgentFilter("all");
                                            setStatusFilter("all");
                                        }}
                                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Legend (only for agents present in current view) */}
                            <div className="flex min-w-0 flex-1 justify-end">
                                <div className="flex flex-wrap items-center gap-2">
                                    {legendAgents.length === 0 ? (
                                        <span className="text-xs text-gray-400">No agents in view</span>
                                    ) : (
                                        legendAgents.map((a) => {
                                            // Try to find one event to read its color for legend
                                            const sample = filtered.find(
                                                (e) => String(e.extendedProps?.agent_id) === String(a.id)
                                            );
                                            const bg = sample?.backgroundColor || "#64748b";
                                            return (
                                                <div
                                                    key={a.id}
                                                    className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1 shadow-sm"
                                                    title={a.name}
                                                >
                                                  <span
                                                      className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/5"
                                                      style={{ backgroundColor: bg }}
                                                  />
                                                    {a.photo_url ? (
                                                        <img
                                                            src={`/storage/${a.photo_url}`}
                                                            className="h-4 w-4 rounded-full object-cover ring-1 ring-gray-200"
                                                            alt={a.name}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full bg-gray-100 ring-1 ring-gray-200" />
                                                    )}
                                                    <span className="max-w-[12ch] truncate text-xs font-medium text-gray-700">
                            {a.name}
                          </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="p-3">
                            {filtered.length === 0 ? (
                                <div className="grid h-[70vh] place-items-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60">
                                    <div className="text-center">
                                        <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-white shadow ring-1 ring-gray-200" />
                                        <p className="text-sm font-medium text-gray-700">No trippings found</p>
                                        <p className="text-xs text-gray-500">
                                            Try adjusting the filters or pick another month.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    height="80vh"
                                    events={filtered}
                                    timeZone="local"
                                    headerToolbar={{
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    nowIndicator
                                    eventClick={(info) => setSelected(info.event)}
                                    eventContent={renderEvent}
                                    displayEventTime
                                    dayMaxEvents={3}
                                    eventDisplay="block"
                                    aspectRatio={1.65}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                        {/* Header strip with color */}
                        <div
                            className="h-1.5 w-full"
                            style={{ backgroundColor: selected.backgroundColor || "#111827" }}
                        />
                        <div className="p-6">
                            <div className="mb-4 flex items-center gap-3">
                                <div
                                    className="h-10 w-10 rounded-full ring-2 ring-white"
                                    style={{ backgroundColor: selected.backgroundColor || "#111827" }}
                                    title={selected.extendedProps?.agent}
                                />
                                <div className="min-w-0">
                                    <h2 className="truncate text-lg font-semibold text-gray-900">
                                        {selected.title || "Tripping"}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {selected.start
                                            ? selected.start.toLocaleString()
                                            : selected.extendedProps?.visit_date}{" "}
                                        • {selected.extendedProps?.status
                                        ? String(selected.extendedProps.status).toUpperCase()
                                        : "SCHEDULED"}
                                    </p>
                                </div>
                            </div>

                            <dl className="grid grid-cols-3 gap-3 text-[13px]">
                                <dt className="col-span-1 text-gray-500">Agent</dt>
                                <dd className="col-span-2 font-medium">
                                    {selected.extendedProps?.agent ?? "Unassigned"}
                                </dd>

                                <dt className="col-span-1 text-gray-500">Buyer</dt>
                                <dd className="col-span-2">
                                    {selected.extendedProps?.buyer ?? "—"}
                                </dd>

                                <dt className="col-span-1 text-gray-500">Property</dt>
                                <dd className="col-span-2">
                                    {selected.extendedProps?.property?.title ?? "—"}
                                    {selected.extendedProps?.property?.address
                                        ? ` — ${selected.extendedProps.property.address}`
                                        : ""}
                                </dd>

                                <dt className="col-span-1 text-gray-500">Time</dt>
                                <dd className="col-span-2">
                                    {selected.extendedProps?.visit_time ?? "—"}
                                </dd>
                            </dl>

                            <div className="mt-6 flex items-center justify-end gap-2">
                                {selected.extendedProps?.property?.id ? (
                                    <a
                                        href={`/properties/${selected.extendedProps.property.id}`}
                                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        View Property
                                    </a>
                                ) : null}
                                <button
                                    className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-white shadow-sm hover:bg-black"
                                    onClick={() => setSelected(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subtle FullCalendar theming */}
            <style>{`
                .fc .fc-toolbar-title { font-weight: 700; color: #111827; }
                .fc .fc-button {
                  border-radius: .75rem;
                  border: 1px solid #e5e7eb;
                  background: #fff;
                  color: #111827;
                  box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
                }
                .fc .fc-button:hover { background: #f9fafb; }
                .fc .fc-button-primary:not(:disabled).fc-button-active,
                .fc .fc-button-primary:not(:disabled):active {
                  background: #111827; border-color: #111827; color: #fff;
                }
                .fc .fc-daygrid-event, .fc .fc-timegrid-event {
                  border: none; border-radius: .6rem;
                  color: #fff;
                }
                .fc .fc-daygrid-day-number { font-weight: 600; color: #374151; }
                .fc .fc-col-header-cell-cushion { font-weight: 600; color: #6b7280; }
                .fc .fc-day-today { background: #f5faff !important; }
                .fc .fc-popover { border-radius: .75rem; overflow: hidden; border: 1px solid #e5e7eb; }
              `}
            </style>
        </AgentLayout>
    );
}
