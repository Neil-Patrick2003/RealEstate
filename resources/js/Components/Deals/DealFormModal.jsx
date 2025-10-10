import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/Components/Modal.jsx";
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError.jsx";
import { BadgeCheck, X } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const money = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
});

// Working hours window
const WORK_START = "09:00";
const WORK_END = "18:00";

function tToMin(t) {
    // t = "HH:MM"
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}
function isWithinWindow(t) {
    const v = tToMin(t);
    return v !== null && v >= tToMin(WORK_START) && v <= tToMin(WORK_END);
}

export default function DealFormModal({ property = {}, isOpen, setIsOpen, initialValue }) {
    const listPrice = Number(property?.price || 0);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        amount: initialValue?.amount ?? "",
        notes: "",
        start_time: initialValue?.start_time ?? "", // NEW
        end_time: initialValue?.end_time ?? "",     // NEW
    });

    const amountNumber = useMemo(
        () => (data.amount === "" || data.amount === null ? "" : Number(data.amount)),
        [data.amount]
    );

    const [touched, setTouched] = useState(false);
    const [touchedTime, setTouchedTime] = useState(false); // NEW
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        } else {
            setTouched(false);
            setTouchedTime(false);
        }
    }, [isOpen]);

    const close = () => setIsOpen(false);

    // ------- TIME VALIDATION -------
    const startOK = isWithinWindow(data.start_time);
    const endOK = isWithinWindow(data.end_time);
    const orderOK =
        tToMin(data.start_time) !== null &&
        tToMin(data.end_time) !== null &&
        tToMin(data.start_time) < tToMin(data.end_time);

    const timeHasError =
        touchedTime &&
        (
            !data.start_time ||
            !data.end_time ||
            !startOK ||
            !endOK ||
            !orderOK
        );

    const onSubmit = (e) => {
        e?.preventDefault?.();

        // amount guard
        const amt = Number(data.amount);
        if (Number.isNaN(amt) || amt <= 0) {
            setTouched(true);
            return;
        }

        // time guards
        if (!data.start_time || !data.end_time) {
            setTouchedTime(true);
            return;
        }
        if (!startOK || !endOK || !orderOK) {
            setTouchedTime(true);
            return;
        }

        const listingId = property?.property_listing?.id;
        if (!listingId) return;

        const payload = {
            amount: data.amount,
            notes: data.notes,
            start_time: data.start_time,
            end_time: data.end_time,
        };

        if (initialValue?.id) {
            put(
                route("property-listings.deals.update", {
                    propertyListing: listingId,
                    deal: initialValue.id,
                }),
                {
                    data: payload,
                    onError: (err) => console.log(err),
                    onSuccess: () => close(),
                }
            );
        } else {
            post(
                route("property-listings.deals.store", { propertyListing: listingId }),
                {
                    data: payload,
                    onError: (err) => console.log(err),
                    onSuccess: () => {
                        close();
                        reset("notes");
                    },
                }
            );
        }
    };

    const setAmountFromChip = (val) => {
        setTouched(true);
        setData("amount", val);
        inputRef.current?.focus();
    };

    const handleAmountChange = (e) => {
        setTouched(true);
        const raw = e.target.value.replace(/[^\d.]/g, "");
        setData("amount", raw === "" ? "" : Number(raw));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            close();
        }
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
        }
    };

    const showClientError =
        touched && (amountNumber === "" || Number.isNaN(Number(amountNumber)) || Number(amountNumber) <= 0);

    const quickChips = useMemo(() => {
        const chips = [];
        if (listPrice > 0) chips.push({ label: "List Price", value: listPrice });
        if (listPrice > 0) chips.push({ label: "+ ₱25k", value: listPrice + 25000 });
        if (listPrice > 0) chips.push({ label: "+ ₱50k", value: listPrice + 50000 });
        if (!chips.length) chips.push({ label: "₱100,000", value: 100000 });
        return chips;
    }, [listPrice]);

    return (
        <Modal show={isOpen} onClose={close} maxWidth="2xl">
            <div
                className="relative rounded-xl bg-white p-6 shadow-lg transition-transform"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label={initialValue ? "Update Offer" : "Send Offer"}
            >
                {/* Close */}
                <button
                    onClick={close}
                    className="absolute right-4 top-4 text-gray-600 hover:text-gray-800 focus:outline-none"
                    aria-label="Close modal"
                    type="button"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {initialValue ? "Update Offer" : "Send Offer"}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {listPrice > 0 ? (
                            <>
                                Current list price: <span className="font-medium">{money.format(listPrice)}</span>
                            </>
                        ) : (
                            "Propose an offer amount for this property."
                        )}
                    </p>
                    <p className="mt-1 text-[12px] text-gray-500">
                        Available hours for viewing/meetings: <b>9:00 AM</b> to <b>6:00 PM</b>.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Amount */}
                    <div>
                        <label htmlFor="deal_amount" className="text-sm font-medium text-gray-700">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    id="deal_amount"
                                    ref={inputRef}
                                    inputMode="decimal"
                                    type="text"
                                    value={amountNumber === "" ? "" : money.format(Number(amountNumber))}
                                    onChange={handleAmountChange}
                                    onFocus={(e) => {
                                        const val = data.amount === "" ? "" : String(data.amount);
                                        e.target.value = val;
                                    }}
                                    onBlur={(e) => {
                                        e.target.value = data.amount === "" ? "" : money.format(Number(data.amount));
                                    }}
                                    placeholder="Enter amount (e.g., 2500000)"
                                    className={cn(
                                        "w-full rounded-md border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary",
                                        showClientError && "border-red-300"
                                    )}
                                />
                                {showClientError && (
                                    <p className="mt-1 text-xs text-red-600">Please enter a valid amount greater than zero.</p>
                                )}
                                <InputError message={errors?.amount} className="mt-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white",
                                    processing ? "cursor-not-allowed opacity-60" : "hover:bg-accent"
                                )}
                                aria-disabled={processing}
                            >
                                <BadgeCheck className="h-4 w-4" />
                                {initialValue ? "Update" : "Send"}
                            </button>
                        </div>

                        {/* Quick chips */}
                        {!!quickChips.length && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {quickChips.map((c) => (
                                    <button
                                        key={c.label}
                                        type="button"
                                        onClick={() => setAmountFromChip(c.value)}
                                        className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                                        title={`Set ${money.format(c.value)}`}
                                    >
                                        {c.label} · {money.format(c.value)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Time window */}
                    <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">
                            Preferred time window <span className="text-red-500">*</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block">
                                <span className="text-xs text-gray-600">Start time (≥ 9:00 AM)</span>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => {
                                        setTouchedTime(true);
                                        setData("start_time", e.target.value);
                                    }}
                                    min={WORK_START}
                                    max={WORK_END}
                                    className={cn(
                                        "mt-1 w-full rounded-md border px-3 py-2 text-sm",
                                        touchedTime && (!data.start_time || !startOK) && "border-red-300"
                                    )}
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs text-gray-600">End time (≤ 6:00 PM)</span>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => {
                                        setTouchedTime(true);
                                        setData("end_time", e.target.value);
                                    }}
                                    min={WORK_START}
                                    max={WORK_END}
                                    className={cn(
                                        "mt-1 w-full rounded-md border px-3 py-2 text-sm",
                                        touchedTime && (!data.end_time || !endOK) && "border-red-300"
                                    )}
                                />
                            </label>
                        </div>

                        {/* Inline time errors */}
                        {timeHasError && (
                            <div className="mt-2 space-y-1 text-xs text-red-600">
                                {!data.start_time && <p>Please choose a start time.</p>}
                                {!data.end_time && <p>Please choose an end time.</p>}
                                {data.start_time && !startOK && <p>Start time must be at or after 09:00.</p>}
                                {data.end_time && !endOK && <p>End time must be at or before 18:00.</p>}
                                {data.start_time && data.end_time && !orderOK && <p>End time must be later than start time.</p>}
                            </div>
                        )}

                        {/* Backend time errors (if any) */}
                        <InputError message={errors?.start_time} className="mt-1" />
                        <InputError message={errors?.end_time} className="mt-1" />
                    </div>
                </form>

                {/* Footer actions */}
                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={processing}
                        className={cn(
                            "rounded-md bg-primary px-5 py-2 text-sm font-medium text-white",
                            processing ? "cursor-not-allowed opacity-60" : "hover:bg-accent"
                        )}
                    >
                        {initialValue ? "Update Offer" : "Send Offer"}
                    </button>
                </div>

                {/* Helper */}
                <p className="mt-3 text-[11px] text-gray-500">
                    Tip: Press <kbd className="rounded border px-1 py-0.5">⌘/Ctrl</kbd> +{" "}
                    <kbd className="rounded border px-1 py-0.5">Enter</kbd> to submit.
                </p>
            </div>
        </Modal>
    );
}
