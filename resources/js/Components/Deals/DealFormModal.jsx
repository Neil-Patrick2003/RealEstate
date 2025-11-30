import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Modal from "@/Components/Modal.jsx";
import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError.jsx";
import { BadgeCheck, X, PhilippinePeso, Handshake, AlertCircle } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const money = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
});

export default function DealFormModal({ property = {}, propertyListingId, isOpen, setIsOpen, initialValue }) {

    console.log("property", property);
    const listPrice = Number(property?.price || 0);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        offer_mode: initialValue?.offer_mode ?? "preferred",
        amount: initialValue?.amount ?? "",
        notes: initialValue?.notes ?? "",
    });

    const amountNumber = useMemo(
        () => (data.amount === "" || data.amount === null ? "" : Number(data.amount)),
        [data.amount]
    );

    const [touched, setTouched] = useState(false);
    const inputRef = useRef(null);

    // Effects
    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        } else {
            setTouched(false);
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
            if (data.amount === listPrice) {
                setData("amount", "");
            }
        }
    }, [data.offer_mode, listPrice, setData]);

    const close = () => setIsOpen(false);

    // Submit Handler
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

                const listingId = propertyListingId ?? property?.property_listing?.id  ;
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
        const raw = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, '$1');
        setData("amount", raw === "" ? "" : raw);
    };

    const displayAmount = (amt) => {
        const num = Number(amt);
        if (Number.isNaN(num) || num === 0) return "";
        return money.format(num);
    }

    const handleAmountFocus = (e) => {
        if (amountDisabled) return;
        e.target.value = data.amount === "" ? "" : String(data.amount);
    };

    const handleAmountBlur = (e) => {
        if (amountDisabled) return;
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

    const headerLine = listPrice > 0 ? (
        <>Current list price: <span className="font-bold text-primary-600">{money.format(listPrice)}</span></>
    ) : "Propose an offer amount for this property.";

    const primaryCtaLabel = initialValue ? "Update Offer" : "Send Offer";

    return (
        <Modal show={isOpen} onClose={close} maxWidth="2xl">
            <div
                className="card p-6 relative"
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label={primaryCtaLabel}
            >
                {/* Close Button */}
                <button
                    onClick={close}
                    className="btn btn-ghost btn-sm absolute right-4 top-4 p-2"
                    aria-label="Close modal"
                    type="button"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="card-header border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Handshake className="h-6 w-6 text-primary-600" />
                        {primaryCtaLabel}
                    </h3>
                    <p className="section-description mt-2">{headerLine}</p>
                </div>

                {/* Offer mode selector */}
                <div className="mb-6">
                    <div className="text-lg font-semibold text-gray-800 mb-4">
                        Choose Your Offer Type
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option 1: List Price */}
                        <label
                            className={cn(
                                "card card-hover p-4 cursor-pointer transition-all border-2",
                                data.offer_mode === "list_price"
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-gray-200"
                            )}
                        >
                            <input
                                type="radio"
                                name="offer_mode"
                                className="form-radio mt-1"
                                checked={data.offer_mode === "list_price"}
                                onChange={() => setData("offer_mode", "list_price")}
                            />
                            <div className="ml-3">
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                    <BadgeCheck className="h-5 w-5 text-primary-600" />
                                    List Price Offer
                                </div>
                                <div className="text-lg font-bold text-primary-600 mt-2">
                                    {listPrice > 0 ? money.format(listPrice) : "N/A"}
                                </div>
                                <div className="text-gray-600 mt-2 text-sm">
                                    A quick, accepted-as-is offer at the current posted price.
                                </div>
                            </div>
                        </label>

                        {/* Option 2: Preferred Amount */}
                        <label
                            className={cn(
                                "card card-hover p-4 cursor-pointer transition-all border-2",
                                data.offer_mode === "preferred"
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-gray-200"
                            )}
                        >
                            <input
                                type="radio"
                                name="offer_mode"
                                className="form-radio mt-1"
                                checked={data.offer_mode === "preferred"}
                                onChange={() => setData("offer_mode", "preferred")}
                            />
                            <div className="ml-3">
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                    <PhilippinePeso className="h-5 w-5 text-primary-600" />
                                    Custom Amount Offer
                                </div>
                                <div className="text-lg font-bold text-gray-700 mt-2">
                                    Enter a preferred price
                                </div>
                                <div className="text-gray-600 mt-2 text-sm">
                                    Propose a specific amount, higher or lower than the list price.
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div className="form-group">
                        <label htmlFor="deal_amount" className="form-label">
                            Offer Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="deal_amount"
                                ref={inputRef}
                                inputMode="decimal"
                                type="text"
                                disabled={amountDisabled}
                                value={
                                    amountDisabled
                                        ? (listPrice > 0 ? money.format(listPrice) : "")
                                        : data.amount === "" ? "" : displayAmount(data.amount)
                                }
                                onChange={handleAmountChange}
                                onFocus={handleAmountFocus}
                                onBlur={handleAmountBlur}
                                placeholder="Enter amount (e.g., 2,500,000)"
                                className={cn(
                                    "form-input text-lg font-bold pr-12",
                                    amountDisabled && "bg-gray-50 cursor-not-allowed",
                                    !amountDisabled && showClientError && "form-input-error"
                                )}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <PhilippinePeso className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Client/Validation Errors */}
                        {(showClientError || errors?.amount) && (
                            <div className="form-error">
                                <AlertCircle className="h-4 w-4" />
                                {errors?.amount || "Please enter a valid amount greater than zero."}
                            </div>
                        )}

                        {/* Quick chips (only for preferred mode) */}
                        {!!quickChips.length && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-gray-500">Quick Adjust:</span>
                                {quickChips.map((c) => {
                                    const isSelected = data.offer_mode === "preferred" && Number(data.amount) === c.value;
                                    return (
                                        <button
                                            key={c.label}
                                            type="button"
                                            onClick={() => !chipsDisabled && setAmountFromChip(c.value)}
                                            className={cn(
                                                "badge text-xs font-medium transition-colors",
                                                chipsDisabled
                                                    ? "badge-gray opacity-50 cursor-not-allowed"
                                                    : isSelected
                                                        ? "badge-primary"
                                                        : "badge-secondary hover:badge-primary"
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
                    <div className="form-group">
                        <label htmlFor="deal_notes" className="form-label">
                            Notes to Agent (Optional)
                        </label>
                        <textarea
                            id="deal_notes"
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="e.g., Mention financing pre-approval, specific timeline needs, or any included appliances."
                            className="form-textarea"
                        />
                        <InputError message={errors?.notes} className="mt-1" />
                    </div>
                </form>

                {/* Footer and Actions */}
                <div className="card-footer border-t border-gray-200 pt-6 mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500">
                            Tip: Press <kbd className="badge-gray text-xs">⌘/Ctrl</kbd> +{" "}
                            <kbd className="badge-gray text-xs">Enter</kbd> to submit.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={close}
                                className="btn btn-outline btn-sm"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={processing || (data.offer_mode === "preferred" && amountIsZeroOrInvalid)}
                                className={cn(
                                    "btn btn-sm",
                                    processing ? "btn-secondary opacity-60" : "btn-primary",
                                    (data.offer_mode === "preferred" && amountIsZeroOrInvalid) && "opacity-40 cursor-not-allowed"
                                )}
                            >
                                {processing ? (initialValue ? "Updating..." : "Sending...") : primaryCtaLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
