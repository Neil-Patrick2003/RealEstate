import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
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

export default function DealFormModal({ property = {}, isOpen, setIsOpen, initialValue }) {
    const listPrice = Number(property?.price || 0);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        offer_mode: initialValue?.offer_mode ?? "preferred", // 'list_price' | 'preferred'
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
            setTouched(false);
        }
    }, [isOpen]);

    // Adjust amount when switching mode
    useEffect(() => {
        if (data.offer_mode === "list_price") {
            setData("amount", listPrice || "");
        }
        if (data.offer_mode === "preferred") {
            setData("amount", "");
        }
    }, [data.offer_mode, listPrice, setData]);

    const close = () => setIsOpen(false);

    // ---- Submit ----
    const onSubmit = useCallback(
        (e) => {
            e?.preventDefault?.();

            // Amount guards
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
        data.offer_mode === "preferred" &&
        touched &&
        (amountNumber === "" ||
            Number.isNaN(Number(amountNumber)) ||
            Number(amountNumber) <= 0);

    const quickChips = useMemo(() => {
        const chips = [];
        if (listPrice > 0) chips.push({ label: "List Price", value: listPrice });
        if (listPrice > 0) chips.push({ label: "+ ₱25k", value: listPrice + 25000 });
        if (listPrice > 0) chips.push({ label: "+ ₱50k", value: listPrice + 50000 });
        if (!chips.length) chips.push({ label: "₱100,000", value: 100000 });
        return chips;
    }, [listPrice]);

    const amountDisabled = data.offer_mode === "list_price";
    const chipsDisabled = data.offer_mode !== "preferred";

    const headerLine =
        listPrice > 0
            ? (
                <>
                    Current list price: <span className="font-medium">{money.format(listPrice)}</span>
                </>
            )
            : "Propose an offer amount for this property.";

    const primaryCtaLabel = initialValue ? "Update Offer" : "Send Offer";

    return (
        <Modal show={isOpen} onClose={close} maxWidth="2xl">
            <div
                className="relative rounded-xl bg-white p-6 shadow-lg transition-transform"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label={primaryCtaLabel}
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
                        {primaryCtaLabel}
                    </h3>
                    <p className="text-sm text-gray-500">{headerLine}</p>
                </div>

                {/* Offer mode selector */}
                <div className="mb-4 rounded-lg border border-gray-200 p-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                        How do you want to proceed?
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                            <input
                                type="radio"
                                name="offer_mode"
                                className="mt-1"
                                checked={data.offer_mode === "list_price"}
                                onChange={() => setData("offer_mode", "list_price")}
                            />
                            <div className="text-sm">
                                <div className="font-medium">Continue at List Price</div>
                                <div className="text-gray-600">
                                    {listPrice > 0 ? money.format(listPrice) : "—"}
                                </div>
                            </div>
                        </label>

                        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                            <input
                                type="radio"
                                name="offer_mode"
                                className="mt-1"
                                checked={data.offer_mode === "preferred"}
                                onChange={() => setData("offer_mode", "preferred")}
                            />
                            <div className="text-sm">
                                <div className="font-medium">Enter Preferred Amount</div>
                                <div className="text-gray-600">Set a custom price</div>
                            </div>
                        </label>
                    </div>
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
                                    disabled={amountDisabled}
                                    value={
                                        amountDisabled
                                            ? (listPrice > 0 ? money.format(listPrice) : "")
                                            : amountNumber === ""
                                                ? ""
                                                : money.format(Number(amountNumber))
                                    }
                                    onChange={handleAmountChange}
                                    onFocus={(e) => {
                                        if (amountDisabled) return;
                                        const val = data.amount === "" ? "" : String(data.amount);
                                        e.target.value = val;
                                    }}
                                    onBlur={(e) => {
                                        if (amountDisabled) return;
                                        e.target.value = data.amount === "" ? "" : money.format(Number(data.amount));
                                    }}
                                    placeholder="Enter amount (e.g., 2500000)"
                                    className={cn(
                                        "w-full rounded-md border border-gray-200 p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary",
                                        !amountDisabled && showClientError && "border-red-300",
                                        amountDisabled && "bg-gray-50 text-gray-500 cursor-not-allowed"
                                    )}
                                />
                                {!amountDisabled && showClientError && (
                                    <p className="mt-1 text-xs text-red-600">
                                        Please enter a valid amount greater than zero.
                                    </p>
                                )}
                                <InputError message={errors?.amount} className="mt-1" />
                            </div>
                        </div>

                        {/* Quick chips (only for preferred mode) */}
                        {!!quickChips.length && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {quickChips.map((c) => (
                                    <button
                                        key={c.label}
                                        type="button"
                                        onClick={() => !chipsDisabled && setAmountFromChip(c.value)}
                                        className={cn(
                                            "rounded-md border px-2.5 py-1.5 text-xs",
                                            chipsDisabled ? "text-gray-400 cursor-not-allowed bg-gray-50" : "hover:bg-gray-50"
                                        )}
                                        title={`Set ${money.format(c.value)}`}
                                        disabled={chipsDisabled}
                                    >
                                        {c.label} · {money.format(c.value)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="deal_notes" className="text-sm font-medium text-gray-700">
                            Notes (optional)
                        </label>
                        <textarea
                            id="deal_notes"
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Optional message to the agent…"
                            className="mt-1 w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <InputError message={errors?.notes} className="mt-1" />
                    </div>
                </form>

                {/* Footer */}
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
                        {primaryCtaLabel}
                    </button>
                </div>

                <p className="mt-3 text-[11px] text-gray-500">
                    Tip: Press <kbd className="rounded border px-1 py-0.5">⌘/Ctrl</kbd> +{" "}
                    <kbd className="rounded border px-1 py-0.5">Enter</kbd> to submit.
                </p>
            </div>
        </Modal>
    );
}
