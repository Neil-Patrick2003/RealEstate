// resources/js/Pages/Agents/TrippingsAgentFull.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import AgentLayout from "@/Layouts/AgentLayout.jsx";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    CalendarDays,
    Check,
    X as XIcon,
    Pencil,
    Eye,
    MapPin,
    Phone,
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
} from "lucide-react";

dayjs.extend(relativeTime);

/* ================= helpers ================= */
const cn = (...c) => c.filter(Boolean).join(" ");
const fmtDate = (d, f = "MMM D, YYYY") => (d ? dayjs(d).format(f) : "—");
const fmtTime = (t) => (t ? dayjs(`1970-01-01T${t}`).format("h:mm A") : "Time TBD");
const toMaps = (address) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "")}`;

// Build a moment from visit_date + visit_time (default time if missing)
const visitMoment = (t) => {
    const date = t?.visit_date;
    const time = t?.visit_time || "09:00:00";
    return dayjs(`${date}T${time}`);
};
const isAfterNow = (t) => visitMoment(t).isAfter(dayjs());
const isBeforeNow = (t) => visitMoment(t).isBefore(dayjs());
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
            const id = setTimeout(async () => {
                try {
                    if ("Notification" in window) {
                        if (Notification.permission === "granted") {
                            new Notification(title, { body, tag: `trip-${tripId}` });
                        } else if (Notification.permission !== "denied") {
                            const p = await Notification.requestPermission();
                            if (p === "granted") new Notification(title, { body, tag: `trip-${tripId}` });
                        }
                    }
                } finally {}
            }, delay);
            timersRef.current[tripId] = id;
        };

        Object.entries(reminders).forEach(([tripId, r]) => {
            if (!r?.when) return;
            schedule(tripId, r.when, r.title, r.body);
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
    // const [localTrips, setLocalTrips] = useState(trippings);
    // useEffect(() => setLocalTrips(trippings), [trippings]);

    /* base lists */
    const pending = useMemo(
        () => trippings.filter((t) => statusLc(t) === "pending"),
        [trippings]
    );

    const upcoming = useMemo(
        () =>
            trippings
                .filter((t) => statusLc(t) === "accepted" && isAfterNow(t))
                .sort((a, b) => visitMoment(a).valueOf() - visitMoment(b).valueOf()),
        [trippings]
    );

    // Completed is now a TRUE status, not inferred by time
    const completed = useMemo(
        () =>
            trippings
                .filter((t) => statusLc(t) === "completed")
                .sort((a, b) => visitMoment(b).valueOf() - visitMoment(a).valueOf()),
        [trippings]
    );

    const acceptedAll = useMemo(
        () => trippings.filter((t) => statusLc(t) === "accepted"),
        [trippings]
    );

    const [tab, setTab] = useState("upcoming"); // pending | upcoming | completed
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [busy, setBusy] = useState({}); // {[id]: 'accept'|'decline'|'reschedule'|'complete'}
    const [confirm, setConfirm] = useState({ type: null, id: null });
    const [resched, setResched] = useState({ open: false, id: null, date: "", time: "" });
    const [selected, setSelected] = useState(null);

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
            const inRange =
                (!from || visitMoment(t).isSameOrAfter(dayjs(from), "day")) &&
                (!to || visitMoment(t).isSameOrBefore(dayjs(to), "day"));
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
        { label: "24h before", minutes: 24 * 60 },
        { label: "1h before", minutes: 60 },
        { label: "15m before", minutes: 15 },
    ];
    const scheduleReminder = (trip, mins) => {
        const when = visitMoment(trip).valueOf() - mins * 60_000;
        if (when <= Date.now()) return alert("That reminder time is already in the past.");
        setReminder({ trip, when });
    };

    /* actions */
    const patchTrip = useCallback((id, action, payload = {}) => {
        setBusy((b) => ({ ...b, [id]: action }));

        // optimistic UI ideas (optional)
        // if (action === "accept") { setLocalTrips((arr) => arr.map((t) => (t.id === id ? { ...t, status: "accepted" } : t))); }
        // if (action === "decline") { setLocalTrips((arr) => arr.map((t) => (t.id === id ? { ...t, status: "declined" } : t))); }
        // if (action === "complete") { setLocalTrips((arr) => arr.map((t) => (t.id === id ? { ...t, status: "completed" } : t))); }

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
    const askDecline = (id) => setConfirm({ type: "decline", id });
    const askComplete = (trip) => {
        if (isAfterNow(trip)) {
            setConfirm({ type: "complete-future", id: trip.id }); // visit hasn't started yet
        } else {
            setConfirm({ type: "complete", id: trip.id });
        }
    };
    const doConfirm = () => {
        if (!confirm.id) return;
        if (confirm.type.startsWith("accept")) {
            patchTrip(confirm.id, "accept");
        } else if (confirm.type === "decline") {
            patchTrip(confirm.id, "decline");
        } else if (confirm.type.startsWith("complete")) {
            patchTrip(confirm.id, "complete"); // backend should set status=completed (and completed_at=now())
        }
        setConfirm({ type: null, id: null });
    };
    const openReschedule = (trip) =>
        setResched({
            open: true,
            id: trip.id,
            date: dayjs(trip.visit_date).format("YYYY-MM-DD"),
            time: trip.visit_time || "09:00",
        });
    const saveReschedule = () => {
        patchTrip(resched.id, "reschedule", {
            visit_date: resched.date,
            visit_time: resched.time || null,
        });
        setResched({ open: false, id: null, date: "", time: "" });
    };

    /* CSV export (current filtered tab) */
    const exportCSV = () => {
        const rows = [
            ["#", "Property", "Address", "Buyer", "Email", "Status", "Visit Date", "Time"],
            ...filtered.map((t, i) => [
                i + 1,
                t?.property?.title ?? "",
                t?.property?.address ?? "",
                t?.buyer?.name ?? "",
                t?.buyer?.email ?? "",
                t?.status ?? "",
                fmtDate(t?.visit_date),
                t?.visit_time ?? "",
            ]),
        ]
            .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trippings_${tab}_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* Incoming (accepted + after now) grouped by day */
    const incomingGrouped = useMemo(() => {
        const incoming = trippings
            .filter((t) => statusLc(t) === "accepted" && isAfterNow(t))
            .sort((a, b) => visitMoment(a).valueOf() - visitMoment(b).valueOf());

        const m = new Map();
        for (const t of incoming) {
            const key = visitMoment(t).format("YYYY-MM-DD");
            if (!m.has(key)) m.set(key, []);
            m.get(key).push(t);
        }
        return Array.from(m.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
    }, [trippings]);

    return (
        <AgentLayout>
            {/* confirm banner */}
            {confirm.type && (
                <div className="fixed top-[64px] left-0 right-0 z-[600]">
                    <div className="mx-auto max-w-3xl bg-white border shadow-sm rounded-md p-4">
                        <div className="flex items-start gap-3">
                            {confirm.type === "accept-conflict" && (
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <div className="text-sm font-medium">
                                    {confirm.type === "accept"
                                        ? "Accept this visit schedule?"
                                        : confirm.type === "accept-conflict"
                                            ? "This overlaps another accepted visit. Accept anyway?"
                                            : confirm.type === "complete"
                                                ? "Mark this visit as completed?"
                                                : confirm.type === "complete-future"
                                                    ? "This visit time hasn’t started yet. Are you sure you want to mark it completed?"
                                                    : "Decline this visit schedule?"}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => setConfirm({ type: null, id: null })}
                                        className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={doConfirm}
                                        className={cn(
                                            "px-3 py-1.5 text-sm rounded-md text-white",
                                            confirm.type.startsWith("accept")
                                                ? "bg-green-600 hover:bg-green-700"
                                                : confirm.type.startsWith("complete")
                                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                                    : "bg-rose-600 hover:bg-rose-700"
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

            <div className="px-4 py-6 space-y-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-gray-800">Agent Tripping Manager</h1>
                    <p className="text-gray-500 text-sm">
                        Incoming schedules with reminders, plus full queue management.
                    </p>
                </header>

                {/* Incoming (Accepted) with reminders */}
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 md:px-6 py-4 border-b flex items-center gap-2 text-gray-700">
                        <CalendarDays className="w-4 h-4" />
                        <h2 className="font-semibold">Incoming Schedule (Accepted)</h2>
                        <span className="ml-auto text-xs text-gray-500">Local time</span>
                    </div>

                    {incomingGrouped.length === 0 ? (
                        <div className="p-6 text-sm text-gray-500">No upcoming visits.</div>
                    ) : (
                        <div className="divide-y">
                            {incomingGrouped.map(([key, items]) => (
                                <section key={key} className="p-4 md:p-6">
                                    <div className="mb-3 font-medium text-gray-800">
                                        {fmtDate(key, "MMMM D, YYYY")}
                                    </div>
                                    <ul className="space-y-3">
                                        {items.map((trip) => {
                                            const r = reminders[trip.id];
                                            const hasReminder = !!r;
                                            return (
                                                <li
                                                    key={trip.id}
                                                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                        {/* left */}
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">
                                                                {trip?.property?.title ?? "Property"}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                                                <Clock className="w-4 h-4" /> {fmtTime(trip.visit_time)}
                                                                <span aria-hidden>•</span>
                                                                <a
                                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline truncate"
                                                                    href={toMaps(trip?.property?.address)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    title={trip?.property?.address}
                                                                >
                                                                    <MapPin className="w-4 h-4" />{" "}
                                                                    {trip?.property?.address ?? "Address not set"}
                                                                </a>
                                                            </div>
                                                            {trip?.buyer?.name || trip?.buyer?.email ? (
                                                                <div className="mt-1 text-xs text-gray-500">
                                                                    With:{" "}
                                                                    <span className="text-gray-700">
                                    {trip?.buyer?.name ?? "—"}
                                  </span>
                                                                    {trip?.buyer?.email ? ` • ${trip.buyer.email}` : ""}
                                                                </div>
                                                            ) : null}
                                                        </div>

                                                        {/* right actions */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {!hasReminder ? (
                                                                <div className="relative">
                                                                    <details className="group">
                                                                        <summary className="list-none">
                                                                            <button
                                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm bg-gray-900 text-white hover:bg-black"
                                                                                type="button"
                                                                            >
                                                                                <Bell className="w-4 h-4" /> Remind me
                                                                            </button>
                                                                        </summary>
                                                                        <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg p-2 w-44 z-[20]">
                                                                            {reminderOptions.map((o) => (
                                                                                <button
                                                                                    key={o.minutes}
                                                                                    onClick={() => scheduleReminder(trip, o.minutes)}
                                                                                    className="w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-50"
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
                                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                    <BellRing className="w-3.5 h-3.5" />
                                    Reminder set {dayjs(r.when).fromNow()}
                                  </span>
                                                                    <button
                                                                        onClick={() => clearReminder(trip.id)}
                                                                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                                                                        type="button"
                                                                        title="Remove reminder"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => downloadICS(trip)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border hover:bg-gray-50"
                                                                type="button"
                                                                title="Add to calendar (.ics)"
                                                            >
                                                                <Download className="w-4 h-4" /> .ics
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

                {/* Controls / Table */}
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
                    {/* Controls */}
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="inline-flex overflow-hidden rounded-md border border-gray-200">
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
                                        "px-4 py-1.5 text-sm",
                                        tab === val
                                            ? "bg-gray-900 text-white"
                                            : "bg-white text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    {label} <span className="opacity-70">({counts[val] || 0})</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <input
                                    value={q}
                                    onChange={(e) => {
                                        setQ(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search buyer, property, address…"
                                    className="rounded-md border border-gray-200 bg-gray-100 px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white"
                                />
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Filter className="h-3.5 w-3.5" /> Date
              </span>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => {
                                    setFrom(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-md border border-gray-200 bg-gray-100 px-2 py-2 text-sm"
                            />
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => {
                                    setTo(e.target.value);
                                    setPage(1);
                                }}
                                className="rounded-md border border-gray-200 bg-gray-100 px-2 py-2 text-sm"
                            />
                            <button
                                onClick={() => {
                                    setQ("");
                                    setFrom("");
                                    setTo("");
                                    setPage(1);
                                }}
                                className="rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
                            >
                                Reset
                            </button>
                            <button
                                onClick={exportCSV}
                                className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
                                title="Export current list to CSV"
                            >
                                <Download className="h-4 w-4" /> Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto rounded-md border">
                        <table className="w-full text-sm text-gray-700">
                            <thead className="bg-gray-50">
                            <tr className="text-left text-xs uppercase text-gray-500">
                                <th className="p-3">#</th>
                                <th className="p-3">Property</th>
                                <th className="p-3">Buyer</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Visit Date</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {paged.length ? (
                                paged.map((trip, idx) => {
                                    const isBusy = busy[trip.id];
                                    const conflict =
                                        statusLc(trip) !== "accepted" && hasConflict(trip, acceptedAll);
                                    const i = (page - 1) * size + idx + 1;

                                    return (
                                        <tr key={trip.id} className="hover:bg-gray-50">
                                            <td className="p-3">{i}</td>

                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={
                                                            trip?.property?.image_url
                                                                ? `/storage/${trip.property.image_url}`
                                                                : "/placeholder.png"
                                                        }
                                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                        alt={trip?.property?.title ?? "Property"}
                                                        className="h-12 w-12 rounded object-cover border border-gray-200"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium text-gray-800">
                                                            {trip?.property?.title ?? "—"}
                                                        </div>
                                                        <div className="truncate text-xs text-gray-500">
                                                            {trip?.property?.address ?? "—"}
                                                        </div>
                                                        <div className="mt-1 flex gap-3 text-xs">
                                                            {trip?.property?.address && (
                                                                <a
                                                                    href={toMaps(trip.property.address)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                                >
                                                                    <MapPin className="h-3.5 w-3.5" /> Maps
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <div className="truncate font-medium text-gray-800">
                                                    {trip?.buyer?.name ?? "—"}
                                                </div>
                                                <div className="truncate text-xs text-gray-500">
                                                    {trip?.buyer?.email ?? ""}
                                                </div>
                                                <div className="mt-1 flex gap-3 text-xs">
                                                    {trip?.buyer?.email && (
                                                        <a
                                                            href={`mailto:${trip.buyer.email}`}
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                        >
                                                            <Mail className="h-3.5 w-3.5" /> Email
                                                        </a>
                                                    )}
                                                    {trip?.buyer?.phone && (
                                                        <a
                                                            href={`tel:${trip.buyer.phone}`}
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                        >
                                                            <Phone className="h-3.5 w-3.5" /> Call
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3 capitalize">
                          <span
                              className={cn(
                                  "inline-block rounded-full px-2 py-0.5 text-xs",
                                  statusPill(trip.status)
                              )}
                          >
                            {statusLc(trip)}
                          </span>
                                                {conflict && (
                                                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                                                        <AlertTriangle className="h-3.5 w-3.5" /> conflict risk
                                                    </div>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap p-3">
                                                {fmtDate(trip.visit_date)}{" "}
                                                {trip.visit_time ? `• ${fmtTime(trip.visit_time)}` : ""}
                                            </td>

                                            <td className="p-3 text-right space-x-2">
                                                {statusLc(trip) === "pending" ? (
                                                    <>
                                                        <button
                                                            onClick={() => askAccept(trip)}
                                                            disabled={!!isBusy}
                                                            className={cn(
                                                                "inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm text-white transition hover:bg-green-700",
                                                                isBusy && "cursor-not-allowed opacity-60"
                                                            )}
                                                            type="button"
                                                        >
                                                            {isBusy === "accept" ? (
                                                                <>
                                                                    <Clock className="h-4 w-4 animate-pulse" /> Saving…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Check className="h-4 w-4" /> Accept
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => askDecline(trip.id)}
                                                            disabled={!!isBusy}
                                                            className={cn(
                                                                "inline-flex items-center gap-1 rounded-md bg-rose-500 px-3 py-1.5 text-sm text-white transition hover:bg-rose-600",
                                                                isBusy && "cursor-not-allowed opacity-60"
                                                            )}
                                                            type="button"
                                                        >
                                                            {isBusy === "decline" ? (
                                                                <>
                                                                    <Clock className="h-4 w-4 animate-pulse" /> Saving…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XIcon className="h-4 w-4" /> Decline
                                                                </>
                                                            )}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-900 hover:text-white"
                                                            type="button"
                                                            onClick={() => setSelected(trip)}
                                                        >
                                                            <Eye className="h-4 w-4" /> View
                                                        </button>
                                                        {statusLc(trip) === "accepted" && (
                                                            <button
                                                                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white transition hover:bg-indigo-700"
                                                                type="button"
                                                                onClick={() => askComplete(trip)}
                                                                disabled={!!isBusy}
                                                                title="Mark this visit as completed"
                                                            >
                                                                {isBusy === "complete" ? (
                                                                    <>
                                                                        <Clock className="h-4 w-4 animate-pulse" /> Saving…
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Check className="h-4 w-4" /> Mark as completed
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                        <button
                                                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm transition hover:bg-slate-200"
                                                            type="button"
                                                            onClick={() => openReschedule(trip)}
                                                            disabled={!!isBusy || statusLc(trip) === "completed"}
                                                            title={statusLc(trip) === "completed" ? "Already completed" : "Reschedule"}
                                                        >
                                                            <Pencil className="h-4 w-4" /> Reschedule
                                                        </button>
                                                        <button
                                                            className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white transition hover:bg-black"
                                                            type="button"
                                                            onClick={() => downloadICS(trip)}
                                                            title=".ics download"
                                                        >
                                                            <Download className="h-4 w-4" /> .ics
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-6 text-center text-gray-400">
                                        No {tab} visits.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2 py-3 sm:px-4">
                        <div className="text-xs text-gray-500">
                            Showing {(page - 1) * size + 1}–{Math.min(page * size, filtered.length)} of {filtered.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={size}
                                onChange={(e) => {
                                    setSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded-md border bg-white px-2 py-1 text-sm"
                            >
                                {[10, 20, 50].map((n) => (
                                    <option key={n} value={n}>
                                        {n} / page
                                    </option>
                                ))}
                            </select>
                            <div className="inline-flex overflow-hidden rounded-md border">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className={cn("px-2 py-1 hover:bg-gray-50", page <= 1 && "cursor-not-allowed opacity-40")}
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="px-3 py-1 text-sm">
                                    {page} / {totalPages}
                                </div>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className={cn("px-2 py-1 hover:bg-gray-50", page >= totalPages && "cursor-not-allowed opacity-40")}
                                    aria-label="Next"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Details Drawer */}
            {selected && (
                <div className="fixed inset-0 z-[700]">
                    <button
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setSelected(null)}
                        aria-label="Close"
                    />
                    <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l bg-white p-5 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Visit Details</h3>
                            <button
                                className="rounded-md p-2 hover:bg-gray-100"
                                onClick={() => setSelected(null)}
                                aria-label="Close"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm">
                            <section className="space-y-2">
                                <div className="font-medium text-gray-900">{selected?.property?.title}</div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="h-4 w-4" /> {selected?.property?.address || "—"}
                                </div>
                                <img
                                    src={
                                        selected?.property?.image_url
                                            ? `/storage/${selected.property.image_url}`
                                            : "/placeholder.png"
                                    }
                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                    className="h-40 w-full rounded-md border object-cover"
                                    alt="Property"
                                />
                            </section>

                            <section className="space-y-1">
                                <div className="font-medium text-gray-900">Buyer</div>
                                {selected?.buyer?.email && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="h-4 w-4" /> {selected?.buyer?.email}
                                    </div>
                                )}
                                {selected?.buyer?.phone && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="h-4 w-4" /> {selected?.buyer?.phone}
                                    </div>
                                )}
                            </section>

                            <section className="space-y-1">
                                <div className="font-medium text-gray-900">Schedule</div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CalendarDays className="h-4 w-4" /> {fmtDate(selected?.visit_date)}{" "}
                                    {selected?.visit_time ? `• ${fmtTime(selected.visit_time)}` : ""}
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={toMaps(selected?.property?.address)}
                                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-gray-50"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <MapPin className="h-4 w-4" /> Open in Maps
                                    </a>
                                    <button
                                        className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black"
                                        onClick={() => downloadICS(selected)}
                                    >
                                        <Download className="h-4 w-4" /> .ics
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {resched.open && (
                <div className="fixed inset-0 z-[750]">
                    <button
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setResched({ open: false, id: null, date: "", time: "" })}
                    />
                    <div className="absolute left-1/2 top-[15%] w-[92vw] max-w-md -translate-x-1/2 rounded-xl border bg-white p-5 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="font-semibold">Reschedule Visit</div>
                            <button
                                className="rounded-md p-2 hover:bg-gray-100"
                                onClick={() => setResched({ open: false, id: null, date: "", time: "" })}
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <label className="block">
                                <span className="text-xs text-gray-600">New date</span>
                                <input
                                    type="date"
                                    value={resched.date}
                                    onChange={(e) => setResched((r) => ({ ...r, date: e.target.value }))}
                                    className="mt-1 w-full rounded-md border px-2 py-2 text-sm"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs text-gray-600">New time (optional)</span>
                                <div className="relative">
                                    <Clock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="time"
                                        value={resched.time}
                                        onChange={(e) => setResched((r) => ({ ...r, time: e.target.value }))}
                                        className="mt-1 w-full rounded-md border pl-8 pr-2 py-2 text-sm"
                                    />
                                </div>
                            </label>

                            {/* inline conflict indicator */}
                            {resched.date &&
                                hasConflict({ visit_date: resched.date, visit_time: resched.time }, acceptedAll) && (
                                    <div className="flex items-center gap-2 text-sm text-amber-700">
                                        <AlertTriangle className="h-4 w-4" /> Warning: this time overlaps another accepted visit.
                                    </div>
                                )}

                            <div className="pt-1 flex justify-end gap-2">
                                <button
                                    className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                                    onClick={() => setResched({ open: false, id: null, date: "", time: "" })}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
                                    onClick={saveReschedule}
                                    disabled={!resched.date}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AgentLayout>
    );
}
