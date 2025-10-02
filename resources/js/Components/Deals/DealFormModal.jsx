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

/**
 * Props:
 * - property: { price?, property_listing?: { id } }
 * - isOpen: boolean
 * - setIsOpen: (bool)=>void
 * - initialValue?: { id, amount }
 *
 * Routes expected:
 * - route('property-listings.deals.store', { propertyListing: id })
 * - route('property-listings.deals.update', { propertyListing: id, deal: id })
 */
export default function DealFormModal({ property = {}, isOpen, setIsOpen, initialValue }) {
    const listPrice = Number(property?.price || 0);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
    } = useForm({
        amount: initialValue?.amount ?? "",
        notes: "",
    });

    const amountNumber = useMemo(
        () => (data.amount === "" || data.amount === null ? "" : Number(data.amount)),
        [data.amount]
    );

    const [touched, setTouched] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        } else {
            // cleanup on close
            setTouched(false);
        }
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
    };

    const onSubmit = (e) => {
        e?.preventDefault?.();

        // basic client-side guard
        const amt = Number(data.amount);
        if (Number.isNaN(amt) || amt <= 0) {
            setTouched(true);
            return;
        }

        const listingId = property?.property_listing?.id;
        if (!listingId) return;

        if (initialValue?.id) {
            put(
                route("property-listings.deals.update", {
                    propertyListing: listingId,
                    deal: initialValue.id,
                }),
                {
                    onError: (err) => console.log(err),
                    onSuccess: () => {
                        close();
                    },
                }
            );
        } else {
            post(
                route("property-listings.deals.store", {
                    propertyListing: listingId,
                }),
                {
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

    // parse numeric on input; keep storage numeric, display formatted separately
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
                className="relative p-6 bg-white rounded-xl shadow-lg transition-transform transform-gpu"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label={initialValue ? "Update Offer" : "Send Offer"}
            >
                {/* Close */}
                <button
                    onClick={close}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
                    aria-label="Close modal"
                    type="button"
                >
                    <X className="w-5 h-5" />
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
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-4">
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
                                        // show plain number when focusing for easy editing
                                        const val = data.amount === "" ? "" : String(data.amount);
                                        e.target.value = val;
                                    }}
                                    onBlur={(e) => {
                                        // revert to formatted
                                        e.target.value =
                                            data.amount === "" ? "" : money.format(Number(data.amount));
                                    }}
                                    placeholder="Enter amount (e.g., 2500000)"
                                    className={cn(
                                        "w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-primary focus:outline-none p-3 text-sm text-gray-900",
                                        showClientError && "border-red-300"
                                    )}
                                />
                                {showClientError && (
                                    <p className="mt-1 text-xs text-red-600">
                                        Please enter a valid amount greater than zero.
                                    </p>
                                )}
                                <InputError message={errors?.amount} className="mt-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-white",
                                    processing ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"
                                )}
                                aria-disabled={processing}
                            >
                                <BadgeCheck className="w-4 h-4" />
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
                                        className="px-2.5 py-1.5 rounded-md text-xs border hover:bg-gray-50"
                                        title={`Set ${money.format(c.value)}`}
                                    >
                                        {c.label} · {money.format(c.value)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer actions */}
                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={close}
                        className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={processing}
                        className={cn(
                            "bg-primary text-white font-medium px-5 py-2 rounded-md text-sm",
                            processing ? "opacity-60 cursor-not-allowed" : "hover:bg-accent"
                        )}
                    >
                        {initialValue ? "Update Offer" : "Send Offer"}
                    </button>
                </div>

                {/* Helper */}
                <p className="mt-3 text-[11px] text-gray-500">
                    Tip: Press <kbd className="px-1 py-0.5 border rounded">⌘/Ctrl</kbd> + <kbd className="px-1 py-0.5 border rounded">Enter</kbd> to submit.
                </p>
            </div>
        </Modal>
    );
}
