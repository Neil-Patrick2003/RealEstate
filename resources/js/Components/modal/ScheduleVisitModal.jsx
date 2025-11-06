// resources/js/Components/modal/ScheduleVisitModal.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import { CalendarDays, Clock, AlertCircle, CheckCircle2, X } from "lucide-react";

// --- Utility Functions (Kept as is for logic) ---
const SLOTS = ["09:00:00", "11:00:00", "13:00:00", "15:00:00", "17:00:00"];
const WORK_START = "09:00";
const WORK_END = "18:00";

const cn = (...c) => c.filter(Boolean).join(" ");
const fmtDate = (d) => dayjs(d).format("MMM D, YYYY");
const fmtTime = (t) => (t && t !== "00:00:00" ? t.slice(0, 5) : "TBD");
const tToMin = (t) => {
    if (!t || !/^\d{2}:\d{2}(:\d{2})?$/.test(t)) return null;
    const [hh, mm] = t.slice(0, 5).split(":").map(Number);
    return hh * 60 + mm;
};
const isWithinWindow = (t) => {
    const v = tToMin(t);
    return v !== null && v >= tToMin(WORK_START) && v <= tToMin(WORK_END);
};
const toHHMMSS = (t) => {
    if (!t) return "";
    return t.length === 5 ? `${t}:00` : t.slice(0, 8);
};

// --- Component Start ---

export default function ScheduleVisitModal({ open, setOpen, visitData }) {

    // (All State, Source Data, Computed Properties, and Handlers are KEPT AS IS)
    // ... [START: Logic Setup] ...

    // --------- Form State ---------
    const [form, setForm] = useState({
        date: "",
        time: "",
        notes: "",
        agentId: null,
        brokerId: null,
        inquiryId: null,
        propertyId: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [timeError, setTimeError] = useState("");

    // --------- Source Data ---------
    const agent = visitData?.agent ?? null;
    const broker = visitData?.broker ?? null;
    const property = visitData?.property ?? null;

    const propertyId = visitData?.propertyId ?? property?.id ?? null;
    const agentIdVD = visitData?.agentId ?? agent?.id ?? null;
    const brokerIdVD = visitData?.brokerId ?? broker?.id ?? null;
    const inquiryId = visitData?.inquiryId ?? null;

    const mode = visitData?.mode === "reschedule" ? "reschedule" : "create";
    const currentTrip = visitData?.tripping ?? null; // {id, visit_date, visit_time, status, notes?}

    // Agent’s upcoming bookings (safe)
    const trips = useMemo(
        () => (Array.isArray(agent?.agent_trippings) ? agent.agent_trippings : []),
        [agent]
    );

    // Booked map: date -> Set(times)
    const bookedByDate = useMemo(() => {
        const map = new Map();
        for (const t of trips) {
            const d = t.visit_date;
            if (!d) continue;
            const time = (t.visit_time || "00:00:00").slice(0, 8);
            if (!map.has(d)) map.set(d, new Set());
            map.get(d).add(time);
        }
        return map;
    }, [trips]);

    const isDateFullyBlocked = (dateStr) => {
        const set = bookedByDate.get(dateStr);
        if (!set) return false;
        return set.has("00:00:00") || SLOTS.every((s) => set.has(s));
    };

    const isSlotBlocked = (dateStr, timeStr) => {
        // When rescheduling: allow keeping the same slot of the current tripping
        const set = bookedByDate.get(dateStr);
        if (!set) return false;
        const sameAsCurrent =
            mode === "reschedule" &&
            currentTrip &&
            dateStr === currentTrip.visit_date &&
            timeStr === toHHMMSS(currentTrip.visit_time || "");
        if (sameAsCurrent) return false;
        return set.has("00:00:00") || set.has(timeStr);
    };

    // Suggested next 7 available dates (from next 14 days)
    const suggestedDates = useMemo(() => {
        const out = [];
        for (let i = 0; i < 14; i++) {
            const d = dayjs().add(i, "day").format("YYYY-MM-DD");
            if (!isDateFullyBlocked(d)) out.push(d);
            if (out.length >= 7) break;
        }
        return out;
    }, [bookedByDate]);

    // Slots filtered by selected date
    const slotsForSelectedDate = useMemo(() => {
        if (!form.date) return [];
        return SLOTS.map((s) => ({ time: s, disabled: isSlotBlocked(form.date, s) }));
    }, [form.date, bookedByDate]);

    // Prefill IDs & initial values
    useEffect(() => {
        if (!visitData) return;

        // Choose initial date/time/notes: prefer explicit initialDate/initialTime, else from currentTrip
        const initialDate =
            visitData.initialDate || currentTrip?.visit_date || "";
        const initialTime =
            toHHMMSS(visitData.initialTime || currentTrip?.visit_time || "");
        const initialNotes = visitData.initialNotes ?? currentTrip?.notes ?? "";

        setForm((prev) => ({
            ...prev,
            agentId: agentIdVD,
            brokerId: brokerIdVD,
            inquiryId,
            propertyId,
            date: initialDate,
            time: initialTime, // keep as HH:mm:ss internally
            notes: initialNotes,
        }));

        // Clear any prior errors when (re)opening
        setError("");
        setTimeError("");
    }, [visitData, agentIdVD, brokerIdVD, inquiryId, propertyId, currentTrip]);

    // If chosen date becomes fully blocked, clear chosen time
    useEffect(() => {
        if (form.date && isDateFullyBlocked(form.date)) {
            setForm((f) => ({ ...f, time: "" }));
        }
        setError("");
        setTimeError("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.date]);

    // Buyer already scheduled for THIS inquiry? (exclude current tripping when rescheduling)
    const buyerAlreadyScheduled = useMemo(() => {
        if (!inquiryId) return false;
        return trips.some((t) => {
            if (mode === "reschedule" && currentTrip && t.id === currentTrip.id) return false;
            const sameInquiry = String(t.inquiry_id ?? "") === String(inquiryId ?? "");
            const status = String(t.status || "").toLowerCase();
            return sameInquiry && !["cancelled", "declined"].includes(status);
        });
    }, [trips, inquiryId, mode, currentTrip]);

    // --------- Handlers ---------
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: name === "time" ? value : value }));
        if (name === "time") {
            const hhmm = value.length >= 5 ? value.slice(0, 5) : value;
            if (hhmm && !isWithinWindow(hhmm)) {
                setTimeError(`Please choose a time between ${WORK_START} and ${WORK_END}.`);
            } else {
                setTimeError("");
            }
        }
        setError("");
    };

    const onPickDate = (d) => {
        if (isDateFullyBlocked(d)) return;
        setForm((f) => ({ ...f, date: d, time: "" }));
        setTimeError("");
        setError("");
    };

    const onPickTime = (t) => {
        if (!form.date) return;
        if (isSlotBlocked(form.date, t)) return;

        const hhmm = t.slice(0, 5);
        if (!isWithinWindow(hhmm)) {
            setTimeError(`Please choose a time between ${WORK_START} and ${WORK_END}.`);
            return;
        }
        setForm((f) => ({ ...f, time: t }));
        setTimeError("");
        setError("");
    };

    const handleSubmit = (e) => {
        e?.preventDefault?.();
        setError("");

        if (mode !== "reschedule" && buyerAlreadyScheduled) {
            setError("You already have a pending/accepted schedule for this inquiry.");
            return;
        }
        if (!form.date) {
            setError("Please select a date.");
            return;
        }
        if (isDateFullyBlocked(form.date)) {
            setError("That date is fully booked. Please choose another day.");
            return;
        }
        if (!form.time) {
            setError("Please select your preferred time.");
            return;
        }

        const hhmm = form.time.length >= 5 ? form.time.slice(0, 5) : form.time;
        if (!isWithinWindow(hhmm)) {
            setTimeError(`Please choose a time between ${WORK_START} and ${WORK_END}.`);
            return;
        }

        const canonical = toHHMMSS(form.time); // HH:mm:ss
        if (isSlotBlocked(form.date, canonical)) {
            setError("That time slot has just been booked. Pick another slot.");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            property_id: form.propertyId,
            inquiry_id: form.inquiryId,
            agent_id: form.agentId,
            broker_id: form.brokerId,
            date: form.date,
            time: canonical,
            notes: form.notes,
        };

        const onDone = () => {
            setIsSubmitting(false);
            setOpen(false);
        };
        const onFail = () => {
            setIsSubmitting(false);
            setError("Something went wrong. Please try again.");
        };

        if (mode === "reschedule" && currentTrip?.id) {
            router.put(`/trippings/${currentTrip.id}`, payload, {
                onSuccess: onDone,
                onError: onFail,
                preserveScroll: true,
            });
        } else {
            router.post("/trippings", payload, {
                onSuccess: onDone,
                onError: onFail,
                preserveScroll: true,
            });
        }
    };

    // ... [END: Logic Setup] ...

    if (!visitData) return null;

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={() => setOpen(false)}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all flex flex-col max-h-[90vh]">

                                {/* Header */}
                                <div className="px-6 py-4 border-b">
                                    <Dialog.Title className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                                        <CalendarDays className="h-6 w-6 text-primary-600" />
                                        {mode === "reschedule" ? "Reschedule Property Visit" : "Schedule a Property Visit"}
                                    </Dialog.Title>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Choose your preferred date and time between **{WORK_START}** and **{WORK_END}**.
                                    </p>
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 overflow-y-auto flex-grow">

                                    {/* Property Summary (Enhanced) */}
                                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-200 shadow-sm">
                                        <img
                                            src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                            alt={property?.title || "Property"}
                                            className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow bg-white flex-shrink-0"
                                            onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Property</p>
                                            <h4 className="text-lg font-bold text-gray-800 truncate leading-snug">{property?.title || "Property"}</h4>
                                            <p className="text-sm text-gray-500 truncate mt-1">{property?.address || "—"}</p>
                                            <p className="text-lg font-extrabold text-primary-600 mt-2">
                                                ₱ {Number(property?.price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Info banners */}
                                    {mode !== "reschedule" && buyerAlreadyScheduled && (
                                        <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 mt-0.5 text-amber-500" />
                                            <p className="font-medium">
                                                **Already Booked:** You already have a pending or accepted schedule for this inquiry. You can only **reschedule** an existing visit.
                                            </p>
                                        </div>
                                    )}

                                    {/* Agent upcoming schedule */}
                                    <div className="mb-6">
                                        <h5 className="text-md font-bold text-gray-800 mb-3 border-b pb-1">Agent’s Upcoming Bookings</h5>
                                        <div className="rounded-xl border border-gray-200 bg-white shadow-inner">
                                            {trips.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-500 italic">No future bookings scheduled yet.</div>
                                            ) : (
                                                <ul className="max-h-36 overflow-y-auto divide-y divide-gray-100">
                                                    {trips
                                                        .slice()
                                                        .sort((a, b) =>
                                                            (a.visit_date + (a.visit_time || "")).localeCompare(
                                                                b.visit_date + (b.visit_time || "")
                                                            )
                                                        )
                                                        .map((t) => (
                                                            <li key={t.id} className="px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                                <span className="text-gray-700 font-medium flex items-center gap-2">
                                                                    <CalendarDays className="h-4 w-4 text-primary-500" />
                                                                    {fmtDate(t.visit_date)}
                                                                    <span className="text-gray-400 mx-2">|</span>
                                                                    <Clock className="h-4 w-4 text-primary-500" />
                                                                    {fmtTime(t.visit_time)}
                                                                </span>
                                                                <span
                                                                    className={cn(
                                                                        "text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
                                                                        String(t.status || "").toLowerCase() === "accepted" && "bg-green-100 text-green-700",
                                                                        String(t.status || "").toLowerCase() === "pending" && "bg-yellow-100 text-yellow-700",
                                                                        String(t.status || "").toLowerCase() === "declined" && "bg-red-100 text-red-700",
                                                                        !t.status && "bg-gray-100 text-gray-500"
                                                                    )}
                                                                >
                                                                    {t.status || "pending"}
                                                                </span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick suggestions */}
                                    <div className="mb-6">
                                        <h5 className="text-md font-bold text-gray-800 mb-3 border-b pb-1">Quick Pick Dates</h5>
                                        <div className="flex flex-wrap gap-3">
                                            {suggestedDates.map((d) => {
                                                const blocked = isDateFullyBlocked(d);
                                                const isSelected = form.date === d;
                                                return (
                                                    <button
                                                        key={d}
                                                        type="button"
                                                        onClick={() => onPickDate(d)}
                                                        className={cn(
                                                            "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                                                            isSelected
                                                                ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                                                : blocked
                                                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                    : "bg-white text-gray-700 hover:bg-primary-50 hover:border-primary-400 border-gray-300"
                                                        )}
                                                        disabled={blocked || (mode !== "reschedule" && buyerAlreadyScheduled)}
                                                        title={blocked ? "Fully booked" : "Select date"}
                                                    >
                                                        {fmtDate(d)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">

                                        {/* Date and Time Pickers */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Date Input */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="visit-date">Preferred Date</label>
                                                <input
                                                    id="visit-date"
                                                    type="date"
                                                    name="date"
                                                    min={dayjs().format("YYYY-MM-DD")}
                                                    value={form.date}
                                                    onChange={onChange}
                                                    required
                                                    disabled={mode !== "reschedule" && buyerAlreadyScheduled}
                                                    className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed p-3"
                                                />
                                                {form.date && isDateFullyBlocked(form.date) && (
                                                    <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> That day is fully booked. Pick another date.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Time Slot Buttons */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Available Time Slots</label>

                                                <div className="flex flex-wrap gap-2">
                                                    {slotsForSelectedDate.length ? (
                                                        slotsForSelectedDate.map(({ time, disabled }) => {
                                                            const isSelected = form.time === time;
                                                            return (
                                                                <button
                                                                    key={time}
                                                                    type="button"
                                                                    onClick={() => onPickTime(time)}
                                                                    disabled={
                                                                        disabled ||
                                                                        (mode !== "reschedule" && buyerAlreadyScheduled) ||
                                                                        !form.date
                                                                    }
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                                                                        isSelected
                                                                            ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                                                            : disabled
                                                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                                : "bg-white text-gray-700 hover:bg-primary-50 hover:border-primary-400 border-gray-300"
                                                                    )}
                                                                    title={disabled ? "Booked" : "Select time"}
                                                                >
                                                                    {time.slice(0, 5)}
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-sm text-gray-500 italic">Select a date above to check availability.</span>
                                                    )}
                                                </div>

                                                {timeError && <p className="mt-2 text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {timeError}</p>}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="notes">Additional Notes</label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                rows={3}
                                                placeholder="e.g., I'm running a bit early/late, please meet me by the main gate, etc."
                                                value={form.notes}
                                                onChange={onChange}
                                                disabled={mode !== "reschedule" && buyerAlreadyScheduled}
                                                className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed p-3"
                                            />
                                        </div>

                                        {/* General error banner */}
                                        {error && (
                                            <div className="rounded-xl bg-rose-50 border border-rose-300 text-rose-700 px-4 py-3 text-sm font-medium flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 mt-0.5 text-rose-500" />
                                                {error}
                                            </div>
                                        )}
                                    </form>
                                </div>

                                {/* Footer / Actions */}
                                <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
                                    {/* Tiny footnote */}
                                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Your request will be sent for confirmation by the agent.
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="px-5 py-2.5 text-sm rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                                            onClick={() => setOpen(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            onClick={handleSubmit} // Attach submit handler to the button
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md",
                                                mode !== "reschedule" && buyerAlreadyScheduled
                                                    ? "bg-gray-300 text-white cursor-not-allowed"
                                                    : "bg-primary-600 hover:bg-primary-700 text-white" // Primary CTA
                                            )}
                                            disabled={isSubmitting || (mode !== "reschedule" && buyerAlreadyScheduled)}
                                        >
                                            {isSubmitting
                                                ? (mode === "reschedule" ? "Saving Changes..." : "Scheduling Visit...")
                                                : (mode === "reschedule" ? "Save Changes" : "Confirm Schedule")
                                            }
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
