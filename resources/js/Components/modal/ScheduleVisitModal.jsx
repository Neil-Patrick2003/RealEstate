// resources/js/Components/modal/ScheduleVisitModal.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import { CalendarDays, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

const slots = ["09:00:00", "11:00:00", "13:00:00", "15:00:00", "17:00:00"];

const cn = (...c) => c.filter(Boolean).join(" ");
const fmtDate = (d) => dayjs(d).format("MMM D, YYYY");
const fmtTime = (t) => (t && t !== "00:00:00" ? t.slice(0, 5) : "TBD");

export default function ScheduleVisitModal({ open, setOpen, visitData }) {
    const [form, setForm] = useState({
        date: "",
        time: "",
        notes: "",
        agentId: null,
        brokerId: null,
        inquiryId: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ---- Source data ----
    const agent = visitData?.agent || null;
    const property = visitData?.property || null;
    const brokerId = visitData?.brokerId || null;
    const inquiryId = visitData?.inquiryId || null;

    const trips = useMemo(
        () => Array.isArray(agent?.agent_trippings) ? agent.agent_trippings : [],
        [agent]
    );

    // Buyer already has a schedule for THIS inquiry?
    const buyerAlreadyScheduled = useMemo(() => {
        return trips.some(
            (t) =>
                String(t.inquiry_id) === String(inquiryId) &&
                !["cancelled", "declined"].includes(String(t.status || "").toLowerCase())
        );
    }, [trips, inquiryId]);

    // Booked map per date/time
    const bookedByDate = useMemo(() => {
        const map = new Map();
        for (const t of trips) {
            const d = t.visit_date; // "YYYY-MM-DD"
            const time = (t.visit_time || "00:00:00").slice(0, 8);
            if (!map.has(d)) map.set(d, new Set());
            map.get(d).add(time || "00:00:00");
        }
        return map;
    }, [trips]);

    const isDateFullyBlocked = (dateStr) => {
        const set = bookedByDate.get(dateStr);
        if (!set) return false;
        // Any "00:00:00" blocks the whole day OR all slots are taken
        return set.has("00:00:00") || slots.every((s) => set.has(s));
    };

    const isSlotBlocked = (dateStr, timeStr) => {
        const set = bookedByDate.get(dateStr);
        if (!set) return false;
        return set.has("00:00:00") || set.has(timeStr);
    };

    // First available date helper (next 14 days)
    const suggestedDates = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 14; i++) {
            const d = dayjs().add(i, "day").format("YYYY-MM-DD");
            // include dates that still have at least one free slot
            if (!isDateFullyBlocked(d)) arr.push(d);
            if (arr.length >= 7) break;
        }
        return arr;
    }, [bookedByDate]);

    // Available slots for the currently chosen date
    const availableSlotsForSelectedDate = useMemo(() => {
        if (!form.date) return [];
        return slots.map((s) => ({ time: s, disabled: isSlotBlocked(form.date, s) }));
    }, [form.date, bookedByDate]);

    // Pre-fill ids when visitData changes
    useEffect(() => {
        if (visitData) {
            setForm((prev) => ({
                ...prev,
                agentId: visitData.agentId || null,
                brokerId: visitData.brokerId || null,
                inquiryId: visitData.inquiryId || null,
            }));
        }
    }, [visitData]);

    // If user picks a date that’s fully blocked, clear time and show guidance
    useEffect(() => {
        if (form.date && isDateFullyBlocked(form.date)) {
            setForm((f) => ({ ...f, time: "" }));
        }
        setError("");
    }, [form.date]); // eslint-disable-line

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (buyerAlreadyScheduled) {
            setError("You already have a visit scheduled for this inquiry.");
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
            setError("Please select a preferred time.");
            return;
        }

        if (isSlotBlocked(form.date, form.time)) {
            setError("That time slot has just been booked. Pick another slot.");
            return;
        }

        setIsSubmitting(true);

        router.post(
            "/trippings",
            {
                property_id: property?.id,
                agent_id: form.agentId,
                inquiry_id: form.inquiryId,
                broker_id: brokerId,
                date: form.date,
                time: form.time,
                notes: form.notes,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    setOpen(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                    setError("Something went wrong. Please try again.");
                },
            }
        );
    };

    if (!visitData) return null;

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
                {/* backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-primary" />
                                    Schedule a Property Visit
                                </Dialog.Title>
                                <p className="text-sm text-gray-500 mt-1 mb-4">
                                    Choose your preferred date and time. The agent will confirm your request.
                                </p>

                                {/* Property Summary */}
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg mb-5 border">
                                    <img
                                        src={property?.image_url ? `/storage/${property.image_url}` : "/placeholder.png"}
                                        alt={property?.title || "Property"}
                                        className="w-20 h-20 rounded-md object-cover border bg-white"
                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 truncate">{property?.title || "Property"}</h4>
                                        <p className="text-sm text-gray-500 truncate">{property?.address || "—"}</p>
                                        <p className="text-sm font-bold text-primary mt-1">
                                            ₱ {(Number(property?.price || 0)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Info banners */}
                                {buyerAlreadyScheduled && (
                                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 mt-0.5" />
                                        You already have a pending/accepted schedule for this inquiry. You can’t book another one.
                                    </div>
                                )}

                                {/* Agent upcoming schedule */}
                                <div className="mb-5">
                                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Agent’s Upcoming Schedule</h5>
                                    <div className="rounded-lg border border-gray-200">
                                        {trips.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-gray-500">No bookings yet.</div>
                                        ) : (
                                            <ul className="max-h-28 overflow-auto divide-y">
                                                {trips
                                                    .slice() // shallow copy
                                                    .sort((a, b) => (a.visit_date + a.visit_time).localeCompare(b.visit_date + b.visit_time))
                                                    .map((t) => (
                                                        <li key={t.id} className="px-3 py-2 text-sm flex items-center justify-between">
                              <span className="text-gray-700">
                                {fmtDate(t.visit_date)} • <Clock className="inline h-3.5 w-3.5 -mt-0.5" /> {fmtTime(t.visit_time)}
                              </span>
                                                            <span className="text-xs text-gray-500 capitalize">{t.status}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Quick suggestions */}
                                <div className="mb-5">
                                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Quick pick dates</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedDates.map((d) => {
                                            const blocked = isDateFullyBlocked(d);
                                            return (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => !blocked && setForm((f) => ({ ...f, date: d, time: "" }))}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-md text-sm border",
                                                        form.date === d
                                                            ? "bg-gray-900 text-white border-gray-900"
                                                            : blocked
                                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
                                                    )}
                                                    disabled={blocked || buyerAlreadyScheduled}
                                                    title={blocked ? "Fully booked" : "Select date"}
                                                >
                                                    {fmtDate(d)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                                            <input
                                                type="date"
                                                name="date"
                                                min={dayjs().format("YYYY-MM-DD")}
                                                value={form.date}
                                                onChange={handleChange}
                                                required
                                                disabled={buyerAlreadyScheduled}
                                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-gray-100"
                                            />
                                            {form.date && isDateFullyBlocked(form.date) && (
                                                <p className="mt-1 text-xs text-amber-700">That day is fully booked. Pick another date.</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Preferred Time</label>

                                            {/* Slot buttons (recommended) */}
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {availableSlotsForSelectedDate.length ? (
                                                    availableSlotsForSelectedDate.map(({ time, disabled }) => (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            onClick={() => setForm((f) => ({ ...f, time }))}
                                                            disabled={disabled || buyerAlreadyScheduled || !form.date}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-md text-sm border",
                                                                form.time === time
                                                                    ? "bg-primary text-white border-primary"
                                                                    : disabled
                                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                        : "bg-white text-gray-800 hover:bg-gray-50 border-gray-200"
                                                            )}
                                                            title={disabled ? "Booked" : "Select time"}
                                                        >
                                                            {time.slice(0, 5)}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500">Pick a date to see available times.</span>
                                                )}
                                            </div>

                                            {/* Fallback time input if needed */}
                                            <input
                                                type="time"
                                                name="time"
                                                value={form.time}
                                                onChange={handleChange}
                                                required
                                                disabled={buyerAlreadyScheduled}
                                                className="mt-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-gray-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                                        <textarea
                                            name="notes"
                                            rows={3}
                                            placeholder="Any specific requests or questions?"
                                            value={form.notes}
                                            onChange={handleChange}
                                            disabled={buyerAlreadyScheduled}
                                            className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-gray-100"
                                        />
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-sm flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 mt-0.5" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700"
                                            onClick={() => setOpen(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className={cn(
                                                "px-5 py-2 rounded-md text-sm font-medium transition",
                                                buyerAlreadyScheduled
                                                    ? "bg-gray-300 text-white cursor-not-allowed"
                                                    : "bg-primary hover:bg-primary-dark text-white"
                                            )}
                                            disabled={isSubmitting || buyerAlreadyScheduled}
                                        >
                                            {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
                                        </button>
                                    </div>
                                </form>

                                {/* Tiny footnote / guidance */}
                                <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    You’ll receive a confirmation once the agent accepts this schedule.
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
