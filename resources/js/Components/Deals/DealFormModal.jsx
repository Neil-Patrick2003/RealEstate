import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Modal from "@/Components/Modal.jsx";
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError.jsx";
import { BadgeCheck, X, DollarSign, Handshake } from "lucide-react";

// Assuming you have primary, accent, and other color utilities defined in Tailwind config
const cn = (...classes) => classes.filter(Boolean).join(" ");

const money = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
});

export default function DealFormModal({ property = {}, isOpen, setIsOpen, initialValue }) {
    const listPrice = Number(property?.price || 0);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        offer_mode: initialValue?.offer_mode ?? "preferred", // 'list_price' | 'preferred'
        amount: initialValue?.amount ?? "",
        notes: initialValue?.notes ?? "", // Added initial notes check
    });

    const amountNumber = useMemo(
        () => (data.amount === "" || data.amount === null ? "" : Number(data.amount)),
        [data.amount]
    );

    const [touched, setTouched] = useState(false);
    const inputRef = useRef(null);

    // --- Logic (Kept mostly as is) ---

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        } else {
            setTouched(false);
            // Re-set form data only on close, ensuring update mode retains notes initially
            if (!initialValue) {
                reset("notes", "amount", "offer_mode");
            }
        }
    }, [isOpen, initialValue, reset]);

    useEffect(() => {
        if (data.offer_mode === "list_price") {
            setData("amount", listPrice || "");
        }
        if (data.offer_mode === "preferred") {
            // Keep the current amount if it was manually entered, otherwise clear
            if (data.amount === listPrice) {
                setData("amount", "");
            }
        }
    }, [data.offer_mode, listPrice, setData]);

    const close = () => setIsOpen(false);

    // ---- Submit ----
    const onSubmit = useCallback(
        (e) => {
            e?.preventDefault?.();

            let payloadAmount = null;
            if (data.offer_mode === "list_price") {
                payloadAmount = listPrice > 0 ? listPrice : null;
            } else {
                const amt = Number(data.amount);
                if (Number.isNaN(amt) || amt <= 0) {
                    setTouched(true);
                    return;
                }
                payloadAmount = amt;
            }

            const listingId = property?.property_listing?.id;
            if (!listingId) return;

            const payload = {
                offer_mode: data.offer_mode,
                amount: payloadAmount,
                notes: data.notes,
            };

            const options = {
                data: payload,
                onError: (err) => console.log(err),
                onSuccess: () => {
                    close();
                    // Do not reset all, only reset what should be cleared for next open
                    reset("notes");
                },
            };

            if (initialValue?.id) {
                put(
                    route("property-listings.deals.update", {
                        propertyListing: listingId,
                        deal: initialValue.id,
                    }),
                    options
                );
            } else {
                post(
                    route("property-listings.deals.store", { propertyListing: listingId }),
                    options
                );
            }
        },
        [
            data.offer_mode,
            data.amount,
            data.notes,
            listPrice,
            property?.property_listing?.id,
            initialValue?.id,
            post,
            put,
            reset,
        ]
    );

    const setAmountFromChip = (val) => {
        setTouched(true);
        setData("amount", val);
        inputRef.current?.focus();
    };

    const handleAmountChange = (e) => {
        setTouched(true);
        // Ensure decimal handling is clean, accepting digits and at most one dot
        const raw = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, '$1');
        setData("amount", raw === "" ? "" : raw); // Keep as string for better input handling
    };

    // Convert string back to number for display logic
    const displayAmount = (amt) => {
        const num = Number(amt);
        if (Number.isNaN(num) || num === 0) return "";
        return money.format(num);
    }

    // Handle focus/blur for number formatting consistency
    const handleAmountFocus = (e) => {
        if (amountDisabled) return;
        // Show raw number on focus for easier editing
        e.target.value = data.amount === "" ? "" : String(data.amount);
    };

    const handleAmountBlur = (e) => {
        if (amountDisabled) return;
        // Format to currency on blur
        e.target.value = displayAmount(data.amount);
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

    const amountIsZeroOrInvalid =
        data.amount === "" ||
        Number.isNaN(Number(data.amount)) ||
        Number(data.amount) <= 0;

    const showClientError =
        data.offer_mode === "preferred" &&
        touched &&
        amountIsZeroOrInvalid;

    const quickChips = useMemo(() => {
        const chips = [];
        if (listPrice > 0) chips.push({ label: "List Price", value: listPrice });
        if (listPrice > 0) chips.push({ label: "+ ₱25k", value: listPrice + 25000 });
        if (listPrice > 0) chips.push({ label: "+ ₱50k", value: listPrice + 50000 });
        if (!chips.length) chips.push({ label: "₱100k", value: 100000 });
        return chips;
    }, [listPrice]);

    const amountDisabled = data.offer_mode === "list_price";
    const chipsDisabled = data.offer_mode !== "preferred";

    const headerLine =
        listPrice > 0
            ? (
                <>
                    Current list price: <span className="font-bold text-primary-600">{money.format(listPrice)}</span>
                </>
            )
            : "Propose an offer amount for this property.";

    const primaryCtaLabel = initialValue ? "Update Offer" : "Send Offer";

    // --- Render ---

    return (
        <Modal show={isOpen} onClose={close} maxWidth="2xl">
            <div
                className="relative rounded-2xl bg-white p-6 shadow-2xl transition-transform flex flex-col"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label={primaryCtaLabel}
            >
                {/* Close Button */}
                <button
                    onClick={close}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors focus:outline-none"
                    aria-label="Close modal"
                    type="button"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Header */}
                <div className="mb-6 border-b pb-3">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Handshake className="h-6 w-6 text-primary-600" />
                        {primaryCtaLabel}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{headerLine}</p>
                </div>

                {/* Offer mode selector */}
                <div className="mb-6">
                    <div className="text-md font-semibold text-gray-800 mb-3">
                        Choose Your Offer Type
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {/* Option 1: List Price */}
                        <label
                            className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all",
                                data.offer_mode === "list_price"
                                    ? "border-primary-600 bg-primary-50 shadow-md"
                                    : "border-gray-200 hover:border-primary-400 hover:bg-primary-50/50"
                            )}
                        >
                            <input
                                type="radio"
                                name="offer_mode"
                                className="mt-1.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                checked={data.offer_mode === "list_price"}
                                onChange={() => setData("offer_mode", "list_price")}
                            />
                            <div className="text-sm">
                                <div className="font-extrabold text-gray-900 flex items-center gap-1">
                                    <BadgeCheck className="h-4 w-4 text-primary-600" />
                                    List Price Offer
                                </div>
                                <div className="text-lg font-bold text-primary-600 mt-1">
                                    {listPrice > 0 ? money.format(listPrice) : "N/A"}
                                </div>
                                <div className="text-gray-600 mt-1">
                                    A quick, accepted-as-is offer at the current posted price.
                                </div>
                            </div>
                        </label>

                        {/* Option 2: Preferred Amount */}
                        <label
                            className={cn(
                                "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all",
                                data.offer_mode === "preferred"
                                    ? "border-primary-600 bg-primary-50 shadow-md"
                                    : "border-gray-200 hover:border-primary-400 hover:bg-primary-50/50"
                            )}
                        >
                            <input
                                type="radio"
                                name="offer_mode"
                                className="mt-1.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                checked={data.offer_mode === "preferred"}
                                onChange={() => setData("offer_mode", "preferred")}
                            />
                            <div className="text-sm">
                                <div className="font-extrabold text-gray-900 flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-primary-600" />
                                    Custom Amount Offer
                                </div>
                                <div className="text-lg font-bold text-gray-700 mt-1">
                                    Enter a preferred price
                                </div>
                                <div className="text-gray-600 mt-1">
                                    Propose a specific amount, higher or lower than the list price.
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div>
                        <label htmlFor="deal_amount" className="text-sm font-bold text-gray-700 mb-2 block">
                            Offer Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="deal_amount"
                                ref={inputRef}
                                inputMode="decimal"
                                type="text"
                                disabled={amountDisabled}
                                // Display formatted or raw based on disabled/focus state
                                value={
                                    amountDisabled
                                        ? (listPrice > 0 ? money.format(listPrice) : "")
                                        : data.amount === "" ? "" : displayAmount(data.amount) // Show formatted on load/blur
                                }
                                onChange={handleAmountChange}
                                onFocus={handleAmountFocus}
                                onBlur={handleAmountBlur}
                                placeholder="Enter amount (e.g., 2,500,000)"
                                className={cn(
                                    "w-full rounded-xl border p-4 text-lg font-bold transition-all",
                                    "focus:outline-none focus:ring-4 focus:ring-primary-100",
                                    amountDisabled
                                        ? "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                                        : "bg-white text-gray-900 border-gray-300",
                                    !amountDisabled && showClientError && "border-red-500 ring-red-100" // Error styling
                                )}
                            />
                        </div>

                        {/* Client/Validation Errors */}
                        {(showClientError || errors?.amount) && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {errors?.amount || "Please enter a valid amount greater than zero."}
                            </p>
                        )}


                        {/* Quick chips (only for preferred mode) */}
                        {!!quickChips.length && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500 self-center hidden sm:inline">Quick Adjust:</span>
                                {quickChips.map((c) => {
                                    const isSelected = data.offer_mode === "preferred" && Number(data.amount) === c.value;
                                    return (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => !chipsDisabled && setAmountFromChip(c.value)}
                                            className={cn(
                                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                                chipsDisabled
                                                    ? "text-gray-400 cursor-not-allowed bg-gray-50 border-gray-200"
                                                    : isSelected
                                                        ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                                        : "text-gray-700 bg-white border-gray-300 hover:bg-primary-50 hover:border-primary-400"
                                            )}
                                            title={`Set ${money.format(c.value)}`}
                                            disabled={chipsDisabled}
                                        >
                                            {c.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="deal_notes" className="text-sm font-bold text-gray-700 mb-2 block">
                            Notes to Agent (Optional)
                        </label>
                        <textarea
                            id="deal_notes"
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="e.g., Mention financing pre-approval, specific timeline needs, or any included appliances."
                            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                        />
                        <InputError message={errors?.notes} className="mt-1" />
                    </div>
                </form>

                {/* Footer and Actions */}
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Tip: Press <kbd className="rounded-md border px-1 py-0.5 text-gray-700 shadow-sm">⌘/Ctrl</kbd> +{" "}
                        <kbd className="rounded-md border px-1 py-0.5 text-gray-700 shadow-sm">Enter</kbd> to submit.
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={processing || (data.offer_mode === "preferred" && amountIsZeroOrInvalid)}
                            className={cn(
                                "rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all",
                                processing ? "cursor-not-allowed opacity-60" : "hover:bg-primary-700 hover:shadow-xl",
                                (data.offer_mode === "preferred" && amountIsZeroOrInvalid) && "cursor-not-allowed opacity-40"
                            )}
                        >
                            {processing ? (initialValue ? "Updating..." : "Sending...") : primaryCtaLabel}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
