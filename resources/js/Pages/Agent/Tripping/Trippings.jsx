// resources/js/Pages/Agents/TrippingsAgentFull.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
    CalendarDays, Check, X as XIcon, Pencil, Eye, MapPin, Mail, Download,
    Clock, Search, Filter, AlertTriangle, ChevronLeft, ChevronRight, Bell, BellRing, Repeat,
} from "lucide-react";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/* ============== helpers ============== */
const cn = (...c) => c.filter(Boolean).join(" ");
const fmtDate = (d, f = "MMM D, YYYY") => (d ? dayjs(d).format(f) : "—");
const fmtTime = (t) => (t ? dayjs(`1970-01-01T${t}`).format("h:mm A") : "Time TBD");
const toMaps = (addr) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr || "")}`;

const visitMoment = (t) => {
    const date = t?.visit_date;
    const time = t?.visit_time || "09:00:00";
    if (!date) return dayjs(0);
    return dayjs(`${date}T${time}`);
};
const isAfterNow = (t) => visitMoment(t).isAfter(dayjs());
const statusLc = (t) => String(t?.status || "").toLowerCase();

const statusPill = (s) => {
    const v = String(s || "").toLowerCase();
    if (v === "pending") return "bg-amber-100 text-amber-700";
    if (v === "accepted") return "bg-green-100 text-green-700";
    if (v === "completed") return "bg-indigo-100 text-indigo-700";
    return "bg-gray-100 text-gray-600";
};

function icsForTrip(trip) {
    const title = (trip?.property?.title ?? "Property Visit").replace(/\n/g, " ");
    const desc = `Buyer: ${trip?.buyer?.name ?? ""}${trip?.buyer?.email ? ` (${trip.buyer.email})` : ""} • ${trip?.property?.address ?? ""}`;
    const start = visitMoment(trip).utc();
    const end = start.add(60, "minute");
    return [
        "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Agent//Trippings//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",
        `UID:${trip.id}@agent-trippings`,
        `DTSTAMP:${dayjs().utc().format("YYYYMMDDTHHmmss[Z]")}`,
        `DTSTART:${start.format("YYYYMMDDTHHmmss[Z]")}`,
        `DTEND:${end.format("YYYYMMDDTHHmmss[Z]")}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${(trip?.property?.address ?? "").replace(/[\n,]/g, " ")}`,
        "END:VEVENT","END:VCALENDAR",
    ].join("\r\n");
}
function downloadICS(trip) {
    const blob = new Blob([icsForTrip(trip)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visit_${trip.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}
function hasConflict(candidate, accepted) {
    const cStart = visitMoment(candidate);
    const cEnd = cStart.add(60, "minute");
    return accepted.some((t) => {
        const tStart = visitMoment(t);
        const tEnd = tStart.add(60, "minute");
        return cStart.isBefore(tEnd) && tStart.isBefore(cEnd);
    });
}

/* =============== reminders hook =============== */
function useReminders(storageKey = "trip-reminders") {
    const [reminders, setReminders] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
    });
    const timersRef = useRef({});

    useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(reminders)); } catch {} }, [reminders, storageKey]);
    useEffect(() => () => Object.values(timersRef.current).forEach(clearTimeout), []);
    useEffect(() => {
        Object.values(timersRef.current).forEach(clearTimeout);
        timersRef.current = {};
        const schedule = (tripId, whenMs, title, body) => {
            const delay = whenMs - Date.now();
            if (delay <= 0) return;
            const checkAndNotify = async () => {
                try {
                    if ("Notification" in window) {
                        let permission = Notification.permission;
                        if (permission === "default") permission = await Notification.requestPermission();
                        if (permission === "granted") new Notification(title, { body, tag: `trip-${tripId}`, icon: "/favicon.ico" });
                    }
                } finally {}
            };
            const id = setTimeout(checkAndNotify, delay);
            timersRef.current[tripId] = id;
        };
        Object.entries(reminders).forEach(([tripId, r]) => { if (r?.when) schedule(tripId, r.when, r.title, r.body); });
    }, [reminders]);

    const setReminder = async ({ trip, when }) => {
        if ("Notification" in window && Notification.permission === "default") {
            try { await Notification.requestPermission(); } catch {}
        }
        const title = `Visit at ${fmtTime(trip.visit_time)} on ${fmtDate(trip.visit_date)}`;
        const body = `${trip?.property?.title ?? "Property"} — ${trip?.property?.address ?? ""}`;
        setReminders((m) => ({ ...m, [trip.id]: { when, title, body } }));
    };
    const clearReminder = (tripId) => {
        if (timersRef.current[tripId]) { clearTimeout(timersRef.current[tripId]); delete timersRef.current[tripId]; }
        setReminders((m) => { const n = { ...m }; delete n[tripId]; return n; });
    };
    return { reminders, setReminder, clearReminder };
}

/* ================= main page ================= */
export default function TrippingsAgentFull({ trippings = [] }) {
    /* base lists */
    const pending   = useMemo(() => trippings.filter((t) => statusLc(t) === "pending"), [trippings]);
    const upcoming  = useMemo(() => trippings.filter((t) => statusLc(t) === "accepted" && isAfterNow(t))
        .sort((a, b) => visitMoment(a) - visitMoment(b)), [trippings]);
    const completed = useMemo(() => trippings.filter((t) => statusLc(t) === "completed")
        .sort((a, b) => visitMoment(b) - visitMoment(a)), [trippings]);
    const acceptedAll = useMemo(() => trippings.filter((t) => statusLc(t) === "accepted"), [trippings]);

    const [tab, setTab] = useState("upcoming"); // pending | upcoming | completed
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [busy, setBusy] = useState({}); // {[id]: action}
    const [confirm, setConfirm] = useState({ type: null, id: null });

    // NEW: Decline modal state (notes)
    const [decline, setDecline] = useState({ open: false, id: null, notes: "" });

    // Reschedule state
    const [resched, setResched] = useState({ open: false, id: null, date: "", time: "" });

    const counts = { pending: pending.length, upcoming: upcoming.length, completed: completed.length };
    const baseList = tab === "pending" ? pending : tab === "upcoming" ? upcoming : completed;

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return baseList.filter((t) => {
            const matchQ =
                !query ||
                t?.property?.title?.toLowerCase().includes(query) ||
                t?.property?.address?.toLowerCase().includes(query) ||
                t?.buyer?.name?.toLowerCase().includes(query) ||
                t?.buyer?.email?.toLowerCase().includes(query);
            const moment = visitMoment(t);
            const inRange =
                (!from || moment.isSameOrAfter(dayjs(from), "day")) &&
                (!to || moment.isSameOrBefore(dayjs(to), "day"));
            return matchQ && inRange;
        });
    }, [baseList, q, from, to]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    useEffect(() => { if (page > totalPages) setPage(totalPages); }, [filtered.length, size, totalPages, page]);
    const paged = useMemo(() => filtered.slice((page - 1) * size, (page - 1) * size + size), [filtered, page, size]);

    const { reminders, setReminder, clearReminder } = useReminders();
    const reminderOptions = [
        { label: "24 hours before", minutes: 24 * 60 },
        { label: "1 hour before", minutes: 60 },
        { label: "15 minutes before", minutes: 15 },
    ];
    const scheduleReminder = (trip, mins) => {
        const when = visitMoment(trip).valueOf() - mins * 60_000;
        if (when <= Date.now()) return alert("That reminder time is already in the past.");
        setReminder({ trip, when });
    };

    /* actions */
    const patchTrip = useCallback((id, action, payload = {}) => {
        setBusy((b) => ({ ...b, [id]: action }));
        router.patch(`/agents/trippings/${id}/${action}`, payload, {
            preserveScroll: true,
            onFinish: () =>
                setBusy((b) => {
                    const n = { ...b };
                    delete n[id];
                    return n;
                }),
        });
    }, []);

    const askAccept = (trip) => {
        if (hasConflict(trip, acceptedAll)) setConfirm({ type: "accept-conflict", id: trip.id });
        else setConfirm({ type: "accept", id: trip.id });
    };

    // UPDATED: open decline modal (with notes)
    const askDecline = (id) => setDecline({ open: true, id, notes: "" });

    const askComplete = (trip) => {
        if (visitMoment(trip).isAfter(dayjs())) setConfirm({ type: "complete-future", id: trip.id });
        else setConfirm({ type: "complete", id: trip.id });
    };

    const doConfirm = () => {
        if (!confirm.id) return;
        if (confirm.type.startsWith("accept")) patchTrip(confirm.id, "accept");
        else if (confirm.type.startsWith("complete")) patchTrip(confirm.id, "complete");
        setConfirm({ type: null, id: null });
    };

    // Reschedule handlers
    const openReschedule = (trip) =>
        setResched({
            open: true,
            id: trip.id,
            date: dayjs(trip.visit_date).format("YYYY-MM-DD"),
            time: (trip.visit_time || "09:00:00").slice(0, 5),
        });
    const saveReschedule = () => {
        patchTrip(resched.id, "reschedule", {
            visit_date: resched.date,
            visit_time: resched.time || null,
        });
        setResched({ open: false, id: null, date: "", time: "" });
    };

    // Group upcoming (accepted) by day
    const incomingGrouped = useMemo(() => {
        const m = new Map();
        for (const t of upcoming) {
            const key = visitMoment(t).format("YYYY-MM-DD");
            if (!m.has(key)) m.set(key, []);
            m.get(key).push(t);
        }
        return Array.from(m.entries());
    }, [upcoming]);

    return (
        // Agent Tripping Manager Component (Redesigned for Flat, Modern Aesthetic)

        <AgentLayout>
            {/* Top confirm banner (flat & high-visibility) */}
            {confirm.type && (
                <div className="fixed top-[64px] left-0 right-0 z-[600] p-4">
                    <div className="mx-auto max-w-3xl bg-white rounded-xl p-4 ring-1 ring-gray-100">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className={cn("w-6 h-6 mt-0.5 shrink-0", confirm.type.startsWith("accept") ? "text-amber-500" : "text-indigo-600")} />
                            <div className="flex-1">
                                <div className="text-base font-semibold text-gray-800">
                                    {confirm.type === "accept"
                                        ? "Accept this visit schedule?"
                                        : confirm.type === "accept-conflict"
                                            ? "This visit overlaps another. Accept anyway?"
                                            : confirm.type === "complete"
                                                ? "Mark this visit as completed?"
                                                : "Visit hasn't started. Mark as completed?"}
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <button onClick={() => setConfirm({ type: null, id: null })} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={doConfirm}
                                        className={cn(
                                            "px-4 py-2 text-sm rounded-lg text-white font-semibold transition",
                                            confirm.type.startsWith("accept")
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-indigo-600 hover:bg-indigo-700"
                                        )}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="px-4 py-8 space-y-10 ">

                {/* --- */}
                <header className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold text-gray-900">Tripping Manager</h1>
                    <p className="text-gray-600 text-base">Track and manage all scheduled property visits with your clients.</p>
                </header>

                {/* --- */}
                <section className="bg-white rounded-xl ring-1 ring-gray-100">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center gap-3 text-gray-800">
                        <CalendarDays className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold">Upcoming Accepted Visits</h2>
                        <span className="ml-auto text-xs text-gray-500 font-medium">Local time</span>
                    </div>

                    {incomingGrouped.length === 0 ? (
                        <div className="p-8 text-sm text-gray-500 text-center">
                            <Clock className="w-6 h-6 mx-auto mb-3" />
                            <p>No accepted visits scheduled in the future.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {incomingGrouped.map(([key, items]) => (
                                <section key={key} className="p-4 md:p-6">
                                    <div className="mb-4 text-base font-bold text-gray-700 border-b border-gray-100 pb-2">
                                        {fmtDate(key, "dddd, MMMM D, YYYY")}
                                    </div>
                                    <ul className="space-y-4">
                                        {items.map((trip) => {
                                            const r = reminders[trip.id];
                                            const hasReminder = !!r;
                                            return (
                                                <li key={trip.id} className="rounded-lg bg-white p-4 ring-1 ring-gray-100 hover:ring-indigo-200 transition">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-bold text-gray-900 truncate text-lg">
                                                                {trip?.property?.title ?? "Property"}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 text-sm mt-1">
                                                        <span className="flex items-center gap-1 font-medium text-indigo-600">
                                                            <Clock className="w-4 h-4" /> {fmtTime(trip.visit_time)}
                                                        </span>
                                                                <a
                                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline truncate max-w-[calc(100%-100px)]"
                                                                    href={toMaps(trip?.property?.address)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    title={trip?.property?.address}
                                                                >
                                                                    <MapPin className="w-4 h-4 text-blue-500" /> {trip?.property?.address ?? "Address not set"}
                                                                </a>
                                                            </div>
                                                            {trip?.buyer?.name || trip?.buyer?.email ? (
                                                                <div className="mt-2 text-xs text-gray-500">
                                                                    Client:{" "}
                                                                    <span className="text-gray-700 font-medium">{trip?.buyer?.name ?? "—"}</span>
                                                                    {trip?.buyer?.email ? (
                                                                        <a href={`mailto:${trip.buyer.email}`} className="text-blue-500 hover:underline">
                                                                            {` • ${trip.buyer.email}`}
                                                                        </a>
                                                                    ) : ""}
                                                                </div>
                                                            ) : null}
                                                        </div>

                                                        {/* Reminder/Calendar Actions */}
                                                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 justify-end sm:justify-start shrink-0">
                                                            {!hasReminder ? (
                                                                <div className="relative">
                                                                    <details className="group">
                                                                        <summary className="list-none focus:outline-none">
                                                                            <button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition" type="button">
                                                                                <Bell className="w-4 h-4" /> Remind me
                                                                            </button>
                                                                        </summary>
                                                                        <div className="absolute right-0 mt-2 bg-white ring-1 ring-gray-200 rounded-lg p-2 w-48 z-[20]">
                                                                            {reminderOptions.map((o) => (
                                                                                <button
                                                                                    key={o.minutes}
                                                                                    onClick={() => scheduleReminder(trip, o.minutes)}
                                                                                    className="w-full text-left text-sm px-3 py-1.5 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                                                                                    type="button"
                                                                                >
                                                                                    {o.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </details>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg font-medium">
                                                                <BellRing className="w-4 h-4" />
                                                                Set for {dayjs(r.when).fromNow()}
                                                            </span>
                                                                    <button
                                                                        onClick={() => clearReminder(trip.id)}
                                                                        className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100"
                                                                        type="button"
                                                                        title="Remove reminder"
                                                                    >
                                                                        <XIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => downloadICS(trip)}
                                                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition"
                                                                type="button"
                                                                title="Add to calendar (.ics)"
                                                            >
                                                                <Download className="w-4 h-4" /> ICS
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    )}
                </section>

                {/* --- */}
                <section className="bg-white rounded-xl ring-1 ring-gray-100 p-4 md:p-6">

                    {/* Controls */}
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                        {/* Tabs */}
                        <div className="inline-flex overflow-hidden rounded-xl ring-1 ring-gray-200">
                            {[
                                ["pending", "Pending"],
                                ["upcoming", "Upcoming"],
                                ["completed", "Completed"],
                            ].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => { setTab(val); setPage(1); }}
                                    className={cn(
                                        "px-5 py-2.5 text-sm font-semibold transition min-w-[120px]",
                                        tab === val
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                                    )}
                                >
                                    {label} <span className="opacity-80 font-normal">({counts[val] || 0})</span>
                                </button>
                            ))}
                        </div>

                        {/* Filters and Export */}
                        <div className="flex flex-wrap items-center gap-3">

                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={q}
                                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                                    placeholder="Search buyer, property, address…"
                                    className="w-full rounded-lg ring-1 ring-gray-200 bg-gray-50 px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                />
                            </div>

                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 font-medium">
                        <Filter className="h-4 w-4" /> Date Range:
                    </span>

                            {/* Date Filters */}
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                                className="rounded-lg ring-1 ring-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:ring-indigo-500 focus:ring-2 transition"
                                title="Date From"
                            />
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => { setTo(e.target.value); setPage(1); }}
                                className="rounded-lg ring-1 ring-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:ring-indigo-500 focus:ring-2 transition"
                                title="Date To"
                            />

                            {/* Reset Button */}
                            <button
                                onClick={() => { setQ(""); setFrom(""); setTo(""); setPage(1); }}
                                className="p-2.5 rounded-lg ring-1 ring-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
                                title="Reset Filters"
                            >
                                <Repeat className="w-4 h-4" />
                            </button>

                            {/* Export Button */}
                            <button
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm text-white hover:bg-indigo-700 transition font-medium"
                                title="Export current list to CSV"
                            >
                                <Download className="h-4 w-4" /> Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto ring-1 ring-gray-100 rounded-lg">
                        <table className="w-full text-sm text-gray-700">
                            <thead className="bg-gray-50">
                            <tr className="text-left text-xs uppercase text-gray-500 tracking-wider">
                                <th className="p-4 font-semibold w-10">#</th>
                                <th className="p-4 font-semibold min-w-[200px]">Property</th>
                                <th className="p-4 font-semibold min-w-[150px]">Buyer</th>
                                <th className="p-4 font-semibold min-w-[100px]">Status</th>
                                <th className="p-4 font-semibold whitespace-nowrap min-w-[150px]">Visit Date</th>
                                <th className="p-4 font-semibold text-right min-w-[150px]">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {paged.length ? (
                                paged.map((trip, idx) => {
                                    const isBusy = busy[trip.id];
                                    const conflict = isAfterNow(trip) && hasConflict(trip, acceptedAll.filter(t => t.id !== trip.id));
                                    const isPending = statusLc(trip) === "pending";
                                    const isAccepted = statusLc(trip) === "accepted";
                                    const isCompleted = statusLc(trip) === "completed";

                                    return (
                                        <tr key={trip.id} className={cn("bg-white hover:bg-gray-50 transition", conflict && isPending && "bg-amber-50/50 hover:bg-amber-100/70")}>
                                            <td className="p-4 font-semibold text-gray-900">{(page - 1) * size + idx + 1}</td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900 truncate max-w-xs">{trip?.property?.title ?? "—"}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-xs">{trip?.property?.address ?? "—"}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{trip?.buyer?.name ?? "—"}</div>
                                                <a href={`mailto:${trip?.buyer?.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3 shrink-0 text-blue-500" /> {trip?.buyer?.email ?? "—"}
                                                </a>
                                            </td>
                                            <td className="p-4">
                                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusPill(trip.status))}>
                                            {trip.status}
                                        </span>
                                                {conflict && isPending && (
                                                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                                                <AlertTriangle className="w-3.5 h-3.5" /> Conflict
                                            </span>
                                                )}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="font-medium">{fmtDate(trip.visit_date)}</div>
                                                <div className="text-xs text-gray-500">{fmtTime(trip.visit_time)}</div>
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-1">
                                                    {trip.property?.id && (
                                                        <a
                                                            href={`/properties/${trip.property.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
                                                            title="View Property Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                    )}

                                                    {/* PENDING ACTIONS */}
                                                    {isPending && (
                                                        <>
                                                            <button
                                                                onClick={() => askAccept(trip)}
                                                                disabled={isBusy}
                                                                className="p-2 rounded-full text-green-600 hover:bg-green-100 disabled:opacity-50 transition"
                                                                title="Accept Tripping"
                                                            >
                                                                {isBusy === "accept" ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => askDecline(trip.id)}
                                                                disabled={isBusy}
                                                                className="p-2 rounded-full text-rose-600 hover:bg-rose-100 disabled:opacity-50 transition"
                                                                title="Decline Tripping"
                                                            >
                                                                {isBusy === "decline" ? <Clock className="w-4 h-4 animate-spin" /> : <XIcon className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => openReschedule(trip)}
                                                                disabled={isBusy}
                                                                className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition"
                                                                title="Suggest Reschedule"
                                                            >
                                                                {isBusy === "reschedule" ? <Clock className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* ACCEPTED ACTIONS */}
                                                    {isAccepted && !isCompleted && (
                                                        <>
                                                            <button
                                                                onClick={() => openReschedule(trip)}
                                                                disabled={isBusy}
                                                                className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition"
                                                                title="Suggest Reschedule"
                                                            >
                                                                {isBusy === "reschedule" ? <Clock className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => askComplete(trip)}
                                                                disabled={isBusy}
                                                                className="p-2 rounded-full text-green-600 hover:bg-green-100 disabled:opacity-50 transition"
                                                                title="Mark as Completed"
                                                            >
                                                                {isBusy === "complete" ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">
                                        No trippings match the current filters.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
                    <span className="text-sm text-gray-600 mb-2 sm:mb-0">
                        Showing <b>{(page - 1) * size + 1}</b> to <b>{Math.min(page * size, filtered.length)}</b> of <b>{filtered.length}</b> results
                    </span>
                            <div className="inline-flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                            Page {page} of {totalPages}
                        </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Reschedule Modal (Minimalist Update) */}
            {resched.open && (
                <div className="fixed inset-0 z-[700] grid place-items-center bg-black/50 p-4 transition-opacity duration-300">
                    <div className="w-full max-w-md rounded-xl bg-white ring-1 ring-gray-100">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-5 border-b border-gray-100 pb-2">Suggest New Time</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="resched-date" className="block text-sm font-medium text-gray-700 mb-1">New Visit Date</label>
                                    <input
                                        id="resched-date"
                                        type="date"
                                        value={resched.date}
                                        onChange={(e) => setResched((r) => ({ ...r, date: e.target.value }))}
                                        min={dayjs().format("YYYY-MM-DD")}
                                        className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-indigo-500 focus:ring-2 border-none p-2.5"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="resched-time" className="block text-sm font-medium text-gray-700 mb-1">New Visit Time</label>
                                    <input
                                        id="resched-time"
                                        type="time"
                                        value={resched.time}
                                        onChange={(e) => setResched((r) => ({ ...r, time: e.target.value }))}
                                        className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-indigo-500 focus:ring-2 border-none p-2.5"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setResched({ open: false, id: null, date: "", time: "" })}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveReschedule}
                                    disabled={!resched.date || busy[resched.id] === "reschedule"}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {busy[resched.id] === "reschedule" ? "Sending Request..." : "Confirm Reschedule"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Decline Reason Modal (Minimalist Update) */}
            {decline.open && (
                <div className="fixed inset-0 z-[710] grid place-items-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white ring-1 ring-gray-100">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Decline Visit</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a short reason. The buyer will be notified.
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="decline-notes">Reason / Notes</label>
                            <textarea
                                id="decline-notes"
                                rows={4}
                                value={decline.notes}
                                onChange={(e) => setDecline((d) => ({ ...d, notes: e.target.value }))}
                                placeholder="e.g., Time conflict, property unavailable on selected date, etc."
                                className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-rose-500 focus:ring-2 border-none p-2.5"
                            />
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    onClick={() => setDecline({ open: false, id: null, notes: "" })}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!decline.id) return;
                                        patchTrip(decline.id, "decline", { notes: decline.notes || null });
                                        setDecline({ open: false, id: null, notes: "" });
                                    }}
                                    disabled={busy[decline.id] === "decline"}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition"
                                >
                                    {busy[decline.id] === "decline" ? "Declining..." : "Confirm Decline"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AgentLayout>
    );
}
