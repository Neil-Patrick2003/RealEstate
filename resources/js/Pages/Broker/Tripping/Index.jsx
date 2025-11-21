import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { Head, router } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
    CalendarDays,
    Check,
    X as XIcon,
    Pencil,
    Eye,
    MapPin,
    Mail,
    Download,
    Clock,
    Search,
    Filter,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Bell,
    BellRing,
    Repeat,
} from "lucide-react";
import BrokerLayout from "@/Layouts/BrokerLayout.jsx";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/* ============== helpers ============== */
const cn = (...c) => c.filter(Boolean).join(" ");
const fmtDate = (d, f = "MMM D, YYYY") => (d ? dayjs(d).format(f) : "—");
const fmtTime = (t) => (t ? dayjs(`1970-01-01T${t}`).format("h:mm A") : "Time TBD");
const toMaps = (addr) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr || "")}`;

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
    if (v === "pending") return "badge-warning";
    if (v === "accepted") return "badge-success";
    if (v === "completed") return "badge-primary";
    return "badge-gray";
};

function icsForTrip(trip) {
    const title = (trip?.property?.title ?? "Property Visit").replace(/\n/g, " ");
    const desc = `Buyer: ${trip?.buyer?.name ?? ""}${
        trip?.buyer?.email ? ` (${trip.buyer.email})` : ""
    } • ${trip?.property?.address ?? ""}`;
    const start = visitMoment(trip).utc();
    const end = start.add(60, "minute");
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Agent//Trippings//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${trip.id}@agent-trippings`,
        `DTSTAMP:${dayjs().utc().format("YYYYMMDDTHHmmss[Z]")}`,
        `DTSTART:${start.format("YYYYMMDDTHHmmss[Z]")}`,
        `DTEND:${end.format("YYYYMMDDTHHmmss[Z]")}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${(trip?.property?.address ?? "").replace(/[\n,]/g, " ")}`,
        "END:VEVENT",
        "END:VCALENDAR",
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
        try {
            return JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch {
            return {};
        }
    });
    const timersRef = useRef({});

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(reminders));
        } catch {}
    }, [reminders, storageKey]);

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
                        if (permission === "granted")
                            new Notification(title, { body, tag: `trip-${tripId}`, icon: "/favicon.ico" });
                    }
                } finally {}
            };
            const id = setTimeout(checkAndNotify, delay);
            timersRef.current[tripId] = id;
        };

        Object.entries(reminders).forEach(([tripId, r]) => {
            if (r?.when) schedule(tripId, r.when, r.title, r.body);
        });
    }, [reminders]);

    const setReminder = async ({ trip, when }) => {
        if ("Notification" in window && Notification.permission === "default") {
            try {
                await Notification.requestPermission();
            } catch {}
        }
        const title = `Visit at ${fmtTime(trip.visit_time)} on ${fmtDate(trip.visit_date)}`;
        const body = `${trip?.property?.title ?? "Property"} — ${trip?.property?.address ?? ""}`;
        setReminders((m) => ({ ...m, [trip.id]: { when, title, body } }));
    };

    const clearReminder = (tripId) => {
        if (timersRef.current[tripId]) {
            clearTimeout(timersRef.current[tripId]);
            delete timersRef.current[tripId];
        }
        setReminders((m) => {
            const n = { ...m };
            delete n[tripId];
            return n;
        });
    };

    return { reminders, setReminder, clearReminder };
}

/* ================= main page ================= */
export default function TrippingsAgentFull({ trippings = [] }) {
    /* base lists */
    const pending = useMemo(() => trippings.filter((t) => statusLc(t) === "pending"), [trippings]);
    const upcoming = useMemo(
        () =>
            trippings
                .filter((t) => statusLc(t) === "accepted" && isAfterNow(t))
                .sort((a, b) => visitMoment(a) - visitMoment(b)),
        [trippings]
    );
    const completed = useMemo(
        () =>
            trippings
                .filter((t) => statusLc(t) === "completed")
                .sort((a, b) => visitMoment(b) - visitMoment(a)),
        [trippings]
    );
    const acceptedAll = useMemo(() => trippings.filter((t) => statusLc(t) === "accepted"), [trippings]);

    const [tab, setTab] = useState("upcoming");
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [busy, setBusy] = useState({});
    const [confirm, setConfirm] = useState({ type: null, id: null });

    const [decline, setDecline] = useState({ open: false, id: null, notes: "" });
    const [resched, setResched] = useState({ open: false, id: null, date: "", time: "" });

    const counts = {
        pending: pending.length,
        upcoming: upcoming.length,
        completed: completed.length,
    };
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
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [filtered.length, size, totalPages, page]);

    const paged = useMemo(
        () => filtered.slice((page - 1) * size, (page - 1) * size + size),
        [filtered, page, size]
    );

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
        router.patch(`/broker/trippings/${id}/${action}`, payload, {
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
        <AuthenticatedLayout>
            <Head title="Schedule Tripping" />

            {/* Confirmation Banner */}
            {confirm.type && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
                    <div className="glass-card p-4 rounded-lg shadow-lg border">
                        <div className="flex items-start gap-3">
                            <AlertTriangle
                                className={cn(
                                    "w-5 h-5 mt-0.5 shrink-0",
                                    confirm.type.startsWith("accept") ? "text-amber-600" : "text-primary-600"
                                )}
                            />
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-900">
                                    {confirm.type === "accept"
                                        ? "Accept this visit schedule?"
                                        : confirm.type === "accept-conflict"
                                            ? "This visit overlaps another. Accept anyway?"
                                            : confirm.type === "complete"
                                                ? "Mark this visit as completed?"
                                                : "Visit hasn't started. Mark as completed?"}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => setConfirm({ type: null, id: null })}
                                        className="btn-secondary btn-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={doConfirm}
                                        className={cn(
                                            "btn btn-sm",
                                            confirm.type.startsWith("accept")
                                                ? "btn-success"
                                                : "btn-primary"
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

            <div className="page-content space-y-6">
                {/* Header */}
                <div className="page-header">
                    <h1 className="text-2xl font-bold text-gray-900">Tripping Manager</h1>
                    <p className="text-gray-600 mt-1">
                        Track and manage all scheduled property visits with your clients.
                    </p>
                </div>

                {/* Upcoming Accepted */}
                <section className="card">
                    <div className="card-header flex items-center gap-3">
                        <div className="feature-icon">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Upcoming Accepted Visits</h2>
                            <p className="text-gray-600 text-sm">Your scheduled property viewings</p>
                        </div>
                        <span className="ml-auto text-xs text-gray-500 font-medium">
                            Local time
                        </span>
                    </div>

                    {incomingGrouped.length === 0 ? (
                        <div className="card-body text-center py-12">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-gray-500">No accepted visits scheduled in the future.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {incomingGrouped.map(([key, items]) => (
                                <section key={key} className="p-6">
                                    <div className="mb-4 text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
                                        {fmtDate(key, "dddd, MMMM D, YYYY")}
                                    </div>
                                    <ul className="space-y-3">
                                        {items.map((trip) => {
                                            const r = reminders[trip.id];
                                            const hasReminder = !!r;
                                            return (
                                                <li
                                                    key={trip.id}
                                                    className="card-hover p-4"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-semibold text-gray-900 truncate">
                                                                {trip?.property?.title ?? "Property"}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 text-sm mt-1">
                                                                <span className="inline-flex items-center gap-1 font-medium text-primary-600">
                                                                    <Clock className="w-4 h-4" />
                                                                    {fmtTime(trip.visit_time)}
                                                                </span>
                                                                <a
                                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline truncate max-w-[calc(100%-100px)]"
                                                                    href={toMaps(trip?.property?.address)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    title={trip?.property?.address}
                                                                >
                                                                    <MapPin className="w-4 h-4 text-blue-500" />{" "}
                                                                    {trip?.property?.address ?? "Address not set"}
                                                                </a>
                                                            </div>
                                                            {(trip?.buyer?.name || trip?.buyer?.email) && (
                                                                <div className="mt-2 text-xs text-gray-500">
                                                                    Client:{" "}
                                                                    <span className="text-gray-700 font-medium">
                                                                        {trip?.buyer?.name ?? "—"}
                                                                    </span>
                                                                    {trip?.buyer?.email ? (
                                                                        <a
                                                                            href={`mailto:${trip.buyer.email}`}
                                                                            className="text-blue-600 hover:underline ml-1"
                                                                        >
                                                                            {trip.buyer.email}
                                                                        </a>
                                                                    ) : (
                                                                        ""
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => downloadICS(trip)}
                                                                className="btn-outline btn-sm"
                                                                title="Download Calendar Event"
                                                            >
                                                                <Download className="w-4 h-4" />
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

                {/* List / Filters */}
                <section className="card">
                    <div className="card-body">
                        {/* Controls */}
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
                            {/* Tabs */}
                            <div className="inline-flex bg-gray-100 rounded-lg p-1">
                                {[
                                    ["pending", "Pending"],
                                    ["upcoming", "Upcoming"],
                                    ["completed", "Completed"],
                                ].map(([val, label]) => (
                                    <button
                                        key={val}
                                        onClick={() => {
                                            setTab(val);
                                            setPage(1);
                                        }}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                            tab === val
                                                ? "bg-white text-primary-600 shadow-sm"
                                                : "text-gray-600 hover:text-gray-700"
                                        )}
                                    >
                                        {label}{" "}
                                        <span className="opacity-70">({counts[val] || 0})</span>
                                    </button>
                                ))}
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search */}
                                <div className="relative flex-1 min-w-[220px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={q}
                                        onChange={(e) => {
                                            setQ(e.target.value);
                                            setPage(1);
                                        }}
                                        placeholder="Search buyer, property, address…"
                                        className="form-input pl-10"
                                    />
                                </div>

                                {/* Date Filters */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={from}
                                        onChange={(e) => {
                                            setFrom(e.target.value);
                                            setPage(1);
                                        }}
                                        className="form-input"
                                        title="Date From"
                                    />
                                    <span className="text-sm text-gray-400">to</span>
                                    <input
                                        type="date"
                                        value={to}
                                        onChange={(e) => {
                                            setTo(e.target.value);
                                            setPage(1);
                                        }}
                                        className="form-input"
                                        title="Date To"
                                    />
                                </div>

                                {/* Reset */}
                                <button
                                    onClick={() => {
                                        setQ("");
                                        setFrom("");
                                        setTo("");
                                        setPage(1);
                                    }}
                                    className="btn-outline btn-sm"
                                    title="Reset Filters"
                                >
                                    <Repeat className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                <tr className="text-left text-xs uppercase text-gray-500 tracking-wider">
                                    <th className="p-3 font-semibold w-10">#</th>
                                    <th className="p-3 font-semibold min-w-[220px]">Property</th>
                                    <th className="p-3 font-semibold min-w-[160px]">Buyer</th>
                                    <th className="p-3 font-semibold min-w-[100px]">Status</th>
                                    <th className="p-3 font-semibold whitespace-nowrap min-w-[150px]">
                                        Visit Date
                                    </th>
                                    <th className="p-3 font-semibold text-right min-w-[150px]">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                {paged.length ? (
                                    paged.map((trip, idx) => {
                                        const isBusy = busy[trip.id];
                                        const conflict =
                                            isAfterNow(trip) &&
                                            hasConflict(trip, acceptedAll.filter((t) => t.id !== trip.id));
                                        const isPending = statusLc(trip) === "pending";
                                        const isAccepted = statusLc(trip) === "accepted";
                                        const isCompleted = statusLc(trip) === "completed";

                                        return (
                                            <tr
                                                key={trip.id}
                                                className={cn(
                                                    "hover:bg-gray-50 transition",
                                                    conflict && isPending && "bg-amber-50 hover:bg-amber-100"
                                                )}
                                            >
                                                <td className="p-3 font-medium text-gray-900">
                                                    {(page - 1) * size + idx + 1}
                                                </td>
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-900 truncate max-w-xs">
                                                        {trip?.property?.title ?? "—"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                                        {trip?.property?.address ?? "—"}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-800">
                                                        {trip?.buyer?.name ?? "—"}
                                                    </div>
                                                    <a
                                                        href={`mailto:${trip?.buyer?.email}`}
                                                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                                                    >
                                                        <Mail className="w-3 h-3 shrink-0 text-blue-500" />{" "}
                                                        {trip?.buyer?.email ?? "—"}
                                                    </a>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                            <span className={cn("badge", statusPill(trip.status))}>
                                                                {trip.status}
                                                            </span>
                                                        {conflict && isPending && (
                                                            <span className="badge-warning inline-flex items-center gap-1 text-xs">
                                                                    <AlertTriangle className="w-3 h-3" /> Conflict
                                                                </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 whitespace-nowrap">
                                                    <div className="font-medium">{fmtDate(trip.visit_date)}</div>
                                                    <div className="text-xs text-gray-500">{fmtTime(trip.visit_time)}</div>
                                                </td>
                                                <td className="p-3 text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-1">
                                                        {trip.property?.id && (
                                                            <a
                                                                href={`/properties/${trip.property.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn-ghost btn-sm"
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
                                                                    disabled={!!isBusy}
                                                                    className="btn-success btn-sm"
                                                                    title="Accept Tripping"
                                                                >
                                                                    {isBusy === "accept" ? (
                                                                        <div className="spinner-sm" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => askDecline(trip.id)}
                                                                    disabled={!!isBusy}
                                                                    className="btn-error btn-sm"
                                                                    title="Decline Tripping"
                                                                >
                                                                    {isBusy === "decline" ? (
                                                                        <div className="spinner-sm" />
                                                                    ) : (
                                                                        <XIcon className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => openReschedule(trip)}
                                                                    disabled={!!isBusy}
                                                                    className="btn-primary btn-sm"
                                                                    title="Suggest Reschedule"
                                                                >
                                                                    {isBusy === "reschedule" ? (
                                                                        <div className="spinner-sm" />
                                                                    ) : (
                                                                        <Pencil className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* ACCEPTED ACTIONS */}
                                                        {isAccepted && !isCompleted && (
                                                            <>
                                                                <button
                                                                    onClick={() => openReschedule(trip)}
                                                                    disabled={!!isBusy}
                                                                    className="btn-primary btn-sm"
                                                                    title="Suggest Reschedule"
                                                                >
                                                                    {isBusy === "reschedule" ? (
                                                                        <div className="spinner-sm" />
                                                                    ) : (
                                                                        <Pencil className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => askComplete(trip)}
                                                                    disabled={!!isBusy}
                                                                    className="btn-success btn-sm"
                                                                    title="Mark as Completed"
                                                                >
                                                                    {isBusy === "complete" ? (
                                                                        <div className="spinner-sm" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
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
                                        <td colSpan={6} className="py-10 text-center text-gray-500">
                                            No trippings match the current filters.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="card-footer flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-sm text-gray-600">
                                    Showing <b>{(page - 1) * size + 1}</b> to{" "}
                                    <b>{Math.min(page * size, filtered.length)}</b> of <b>{filtered.length}</b> results
                                </span>
                                <div className="inline-flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn-ghost btn-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-md">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="btn-ghost btn-sm"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Reschedule Modal */}
            {resched.open && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="card w-full max-w-md">
                        <div className="card-body">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggest New Time</h3>
                            <div className="space-y-4">
                                <div className="form-group">
                                    <label htmlFor="resched-date" className="form-label">
                                        New Visit Date
                                    </label>
                                    <input
                                        id="resched-date"
                                        type="date"
                                        value={resched.date}
                                        onChange={(e) => setResched((r) => ({ ...r, date: e.target.value }))}
                                        min={dayjs().format("YYYY-MM-DD")}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="resched-time" className="form-label">
                                        New Visit Time
                                    </label>
                                    <input
                                        id="resched-time"
                                        type="time"
                                        value={resched.time}
                                        onChange={(e) => setResched((r) => ({ ...r, time: e.target.value }))}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setResched({ open: false, id: null, date: "", time: "" })}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveReschedule}
                                    disabled={!resched.date || busy[resched.id] === "reschedule"}
                                    className="btn-primary"
                                >
                                    {busy[resched.id] === "reschedule" ? "Sending..." : "Confirm Reschedule"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Decline Reason Modal */}
            {decline.open && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="card w-full max-w-md">
                        <div className="card-body">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Decline Visit</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a short reason. The buyer will be notified.
                            </p>
                            <div className="form-group">
                                <label className="form-label" htmlFor="decline-notes">
                                    Reason / Notes
                                </label>
                                <textarea
                                    id="decline-notes"
                                    rows={4}
                                    value={decline.notes}
                                    onChange={(e) => setDecline((d) => ({ ...d, notes: e.target.value }))}
                                    placeholder="e.g., Time conflict, property unavailable on selected date, etc."
                                    className="form-input"
                                />
                            </div>
                            <div className="mt-5 flex justify-end gap-2">
                                <button
                                    onClick={() => setDecline({ open: false, id: null, notes: "" })}
                                    className="btn-secondary"
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
                                    className="btn-error"
                                >
                                    {busy[decline.id] === "decline" ? "Declining..." : "Confirm Decline"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
