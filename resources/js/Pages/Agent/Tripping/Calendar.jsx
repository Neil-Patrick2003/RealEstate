// resources/js/Pages/Trippings/Calendar.jsx
import React, { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { X, Calendar as CalendarIcon, MapPin, Clock, User, Briefcase, ChevronDown, Repeat, ExternalLink } from "lucide-react";

const cn = (...c) => c.filter(Boolean).join(" ");

// Simplified status rendering utility
const STATUS_STYLES = {
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    scheduled: "bg-sky-50 text-sky-700 ring-sky-200",
    canceled: "bg-rose-50 text-rose-700 ring-rose-200",
    missed: "bg-amber-50 text-amber-700 ring-amber-200",
};

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
        const statusClass = STATUS_STYLES[ex.status?.toLowerCase()] || "bg-gray-100 text-gray-700 ring-gray-200";

        return (
            <div className="flex items-center gap-1.5 px-1 py-0.5 sm:px-2 sm:py-1 h-full min-w-0">
                {/* Agent Avatar */}
                {ex.agent_photo ? (
                    <img
                        src={ex.agent_photo}
                        alt={ex.agent}
                        className="h-5 w-5 rounded-full object-cover ring-1 ring-white/60 shrink-0"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-5 w-5 rounded-full bg-white/30 ring-1 ring-white/60 shrink-0 flex items-center justify-center">
                        <User className="w-3 h-3 text-white/80" />
                    </div>
                )}

                {/* Text Content */}
                <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="truncate text-[12px] leading-tight font-semibold text-white">
                        {info.event.title}
                    </div>
                    <div className="truncate text-[10px] leading-tight font-medium opacity-90 text-white/80 hidden sm:block">
                        {ex.agent ?? "Unassigned"}
                    </div>
                </div>

                {/* Status Chip */}
                {ex.status && (
                    <span
                        className={cn(
                            "ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ring-1",
                            statusClass
                        )}
                    >
                        {String(ex.status).charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
        );
    };

    const StatusDetailBadge = ({ status }) => {
        const s = status?.toLowerCase() || '';
        const statusClass = STATUS_STYLES[s] || "bg-gray-100 text-gray-700";
        return (
            <span
                className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold shadow-sm",
                    statusClass
                )}
            >
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        );
    };

    // --- Detail Modal Component ---
    const DetailModal = () => {
        if (!selected) return null;
        const ex = selected.extendedProps;
        const start = selected.start ? selected.start.toLocaleString() : ex.visit_date;

        return (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 transition-opacity duration-300">
                <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 scale-100 transition-transform duration-300">

                    {/* Header strip with agent color */}
                    <div
                        className="h-2 w-full"
                        style={{ backgroundColor: selected.backgroundColor || "#111827" }}
                    />

                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            {/* Title and Status */}
                            <div className="min-w-0 pr-4">
                                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                                    {selected.title || "Tripping Details"}
                                </h2>
                                <p className="mt-1">
                                    <StatusDetailBadge status={ex.status} />
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                                onClick={() => setSelected(null)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <hr className="my-5 border-gray-100" />

                        {/* Detail Grid */}
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">

                            {/* Date & Time */}
                            <div className="space-y-1">
                                <dt className="flex items-center gap-2 text-gray-500 font-medium">
                                    <Clock className="w-4 h-4 text-primary" />
                                    Date & Time
                                </dt>
                                <dd className="text-gray-800 font-semibold pl-6">{start}</dd>
                            </div>

                            {/* Agent */}
                            <div className="space-y-1">
                                <dt className="flex items-center gap-2 text-gray-500 font-medium">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    Assigned Agent
                                </dt>
                                <dd className="text-gray-800 font-semibold pl-6 flex items-center gap-2">
                                    {ex.agent_photo && (
                                        <img
                                            src={ex.agent_photo}
                                            alt={ex.agent}
                                            className="h-6 w-6 rounded-full object-cover shrink-0"
                                        />
                                    )}
                                    {ex.agent ?? "Unassigned"}
                                </dd>
                            </div>

                            {/* Buyer */}
                            <div className="space-y-1">
                                <dt className="flex items-center gap-2 text-gray-500 font-medium">
                                    <User className="w-4 h-4 text-primary" />
                                    Client/Buyer
                                </dt>
                                <dd className="text-gray-800 font-medium pl-6">{ex.buyer ?? "—"}</dd>
                            </div>

                            {/* Property Location */}
                            <div className="space-y-1 sm:col-span-2">
                                <dt className="flex items-center gap-2 text-gray-500 font-medium">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Property
                                </dt>
                                <dd className="text-gray-800 font-medium pl-6">
                                    {ex.property?.title ?? "—"}
                                    <span className="text-gray-500 italic block text-xs mt-1">
                                        {ex.property?.address}
                                    </span>
                                </dd>
                            </div>
                        </dl>

                        {/* Actions */}
                        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            {ex.property?.id && (
                                <a
                                    href={`/properties/${ex.property.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Property
                                </a>
                            )}
                            <button
                                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-black transition"
                                onClick={() => setSelected(null)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---
    return (
        <AgentLayout>
            <Head title="Agent Tripping Calendar" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <div className=" space-y-6">

                    {/* Header */}
                    <div className="pb-2 border-b border-gray-200">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            Tripping Schedule
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Monitor and manage all scheduled property viewings in real-time.
                        </p>
                    </div>

                    {/* Main Calendar Card */}
                    <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">

                        {/* Toolbar (Sticky and modernized) */}
                        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-gray-100 bg-white rounded-t-2xl p-4 sm:flex-row sm:items-center sm:justify-between">

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Agent Filter */}
                                <div className="relative">
                                    <select
                                        value={agentFilter}
                                        onChange={(e) => setAgentFilter(e.target.value)}
                                        className="rounded-xl appearance-none border-gray-300 bg-gray-50 pr-8 pl-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition cursor-pointer"
                                    >
                                        <option value="all">All Agents</option>
                                        {agents.map((a) => (
                                            <option value={a.id} key={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="rounded-xl appearance-none border-gray-300 bg-gray-50 pr-8 pl-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition cursor-pointer"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="canceled">Canceled</option>
                                        <option value="missed">Missed</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Reset Button */}
                                {(agentFilter !== "all" || statusFilter !== "all") && (
                                    <button
                                        onClick={() => {
                                            setAgentFilter("all");
                                            setStatusFilter("all");
                                        }}
                                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition"
                                    >
                                        <Repeat className="w-4 h-4 inline mr-1" />
                                        Reset Filters
                                    </button>
                                )}
                            </div>

                            {/* Legend (Visual emphasis) */}
                            <div className="flex min-w-0 flex-1 justify-start sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                                <div className="flex flex-wrap items-center gap-3">
                                    {legendAgents.length === 0 ? (
                                        <span className="text-xs text-gray-400">No agents in current view</span>
                                    ) : (
                                        legendAgents.map((a) => {
                                            const sample = filtered.find(
                                                (e) => String(e.extendedProps?.agent_id) === String(a.id)
                                            );
                                            const bg = sample?.backgroundColor || "#64748b";
                                            return (
                                                <div
                                                    key={a.id}
                                                    className="group flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 shadow-inner"
                                                    title={a.name}
                                                >
                                                    <span
                                                        className="inline-block h-2 w-2 rounded-full ring-1 ring-black/10"
                                                        style={{ backgroundColor: bg }}
                                                    />
                                                    {a.photo_url ? (
                                                        <img
                                                            src={`/storage/${a.photo_url}`}
                                                            className="h-4 w-4 rounded-full object-cover"
                                                            alt={a.name}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full bg-gray-200" />
                                                    )}
                                                    <span className="max-w-[10ch] truncate text-xs font-semibold text-gray-700">
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
                        <div className="p-2 sm:p-5">
                            {filtered.length === 0 ? (
                                <div className="grid h-[70vh] place-items-center rounded-xl border-4 border-dashed border-gray-100 bg-gray-50">
                                    <div className="text-center">
                                        <CalendarIcon className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                                        <p className="text-lg font-medium text-gray-700">No Trippings Scheduled</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Try broadening your filters or scheduling a new viewing.
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
                                    // Event styling override for better visual contrast and rounded edges
                                    eventDidMount={(info) => {
                                        info.el.style.borderRadius = '0.5rem';
                                        info.el.style.padding = '0';
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail modal (Rendered with new component) */}
            <DetailModal />

            {/* Subtle FullCalendar theming (Updated styles) */}
            <style>{`
                .fc-direction-ltr .fc-daygrid-event.fc-event-end,
                .fc-direction-rtl .fc-daygrid-event.fc-event-start {
                    /* Remove default rounded border on edges that interferes with custom styles */
                    border-radius: 0.5rem;
                }
                .fc .fc-toolbar-title { font-weight: 800; color: #1f2937; font-size: 1.5rem; }
                .fc .fc-button {
                  border-radius: .75rem;
                  border: 1px solid #d1d5db;
                  background: #fff;
                  color: #374151;
                  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
                  font-weight: 600;
                  text-transform: none;
                }
                .fc .fc-button:hover { background: #f9fafb; }
                .fc .fc-button-primary:not(:disabled).fc-button-active,
                .fc .fc-button-primary:not(:disabled):active {
                  background: #111827; border-color: #111827; color: #fff;
                }
                .fc .fc-daygrid-event, .fc .fc-timegrid-event {
                  border: none;
                  border-radius: .5rem !important; /* Force rounded corners */
                  color: #fff;
                  padding: 0; /* Remove default padding */
                }
                .fc .fc-daygrid-day-number { font-weight: 700; color: #1f2937; }
                .fc .fc-col-header-cell-cushion { font-weight: 600; color: #4b5563; }
                .fc .fc-day-today { background: #f0f9ff !important; }
                .fc .fc-popover { border-radius: 1rem; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
              `}
            </style>
        </AgentLayout>
    );
}
