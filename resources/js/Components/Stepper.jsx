// resources/js/Components/Stepper.jsx
import React from "react";
import {
    MessageSquare,
    CalendarDays,
    Handshake,
    CreditCard,
    CheckCircle2,
    Clock,
    Lock
} from "lucide-react";

// Small Chip Component
function SmallChip({ color = "gray", children }) {
    const colorClasses = {
        gray: "bg-gray-100 text-gray-700",
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        amber: "bg-amber-100 text-amber-700",
        rose: "bg-rose-100 text-rose-700",
    };

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
            {children}
        </span>
    );
}

// Step Card Component - Simplified design
function StepCard({
                      state,
                      title,
                      description,
                      Icon,
                      actionLabel,
                      onAction,
                      disabled = false,
                      rightBadge,
                      isProcessingPayment = false,
                  }) {
    const stateConfig = {
        complete: {
            icon: CheckCircle2,
            iconClass: "text-green-600",
            bgClass: "bg-green-50 border-green-200",
            titleClass: "text-green-900",
            descClass: "text-green-700",
        },
        current: {
            icon: Clock,
            iconClass: "text-blue-600",
            bgClass: "bg-blue-50 border-blue-200",
            titleClass: "text-blue-900",
            descClass: "text-blue-700",
        },
        upcoming: {
            icon: Icon,
            iconClass: "text-gray-400",
            bgClass: "bg-gray-50 border-gray-200",
            titleClass: "text-gray-900",
            descClass: "text-gray-500",
        },
        locked: {
            icon: Lock,
            iconClass: "text-gray-300",
            bgClass: "bg-gray-50 border-gray-200",
            titleClass: "text-gray-400",
            descClass: "text-gray-400",
        },
    };

    const config = stateConfig[state] || stateConfig.locked;
    const StateIcon = config.icon;

    return (
        <div className={`p-4 rounded-lg border-2 ${config.bgClass} transition-all duration-200 h-full flex flex-col`}>
            <div className="flex items-start gap-3 mb-2">
                <StateIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-semibold ${config.titleClass}`}>
                            {title}
                        </h3>
                        {rightBadge}
                    </div>
                </div>
            </div>

            <p className={`text-xs ${config.descClass} mb-3 flex-1`}>
                {description}
            </p>

            {actionLabel && (
                <div className="mt-auto">
                    {isProcessingPayment ? (
                        // Show as status text for processing payment
                        <span className="text-xs font-medium text-blue-600">
                            {actionLabel}
                        </span>
                    ) : (
                        // Show as button for other actions
                        <button
                            onClick={onAction}
                            disabled={disabled || !onAction}
                            className={`text-xs font-medium ${
                                state === "complete"
                                    ? "text-green-600 hover:text-green-500"
                                    : state === "current"
                                        ? "text-blue-600 hover:text-blue-500"
                                        : "text-gray-600 hover:text-gray-500"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Constants
const ICONS = {
    inquiry: MessageSquare,
    appointment: CalendarDays,
    offer: Handshake,
    payment: CreditCard,
};

const TITLES = {
    inquiry: "Send Inquiry",
    appointment: "Schedule Visit",
    offer: "Make Offer",
    payment: "Payment",
};

const DESCRIPTIONS = {
    inquiry: {
        complete: "Inquiry sent and accepted",
        current: "Inquiry pending approval",
        upcoming: "Send inquiry to agent",
        locked: "Complete previous steps first",
    },
    appointment: {
        complete: "Property visit completed",
        current: "Schedule your property visit",
        upcoming: "Schedule after inquiry acceptance",
        locked: "Complete inquiry first",
    },
    offer: {
        complete: "Offer submitted and accepted",
        current: "Make an offer on the property",
        upcoming: "Make offer after visit completion",
        locked: "Complete visit first",
    },
    payment: {
        complete: "Payment completed successfully",
        current: "Processing payment in progress",
        upcoming: "Proceed with payment",
        locked: "Complete offer first",
    },
};

export default function Stepper({
                                    steps,
                                    onAction = {},
                                    labels = {},
                                    descriptions = {},
                                    showViewOnComplete = true,
                                    disabled = false,
                                    className = "",
                                    appointmentStatus = "none",
                                    dealStatus = "draft", // Add dealStatus prop
                                }) {

    const ordered = ["inquiry", "appointment", "offer", "payment"];

    console.log(dealStatus);
    // Check if deal is closed
    const isDealClosed = dealStatus?.toLowerCase().includes('sold');

    const getDescription = (key, state) => {
        // If deal is closed, show completion messages for all steps
        if (isDealClosed) {
            switch (key) {
                case "inquiry":
                    return "Inquiry completed successfully";
                case "appointment":
                    return "Property visit completed";
                case "offer":
                    return "Offer accepted and finalized";
                case "payment":
                    return "Payment completed successfully";
                default:
                    return "Step completed";
            }
        }

        // Special handling for appointment based on appointmentStatus
        if (key === "appointment") {
            if (appointmentStatus === "pending") return "Visit pending approval";
            if (appointmentStatus === "accepted" || appointmentStatus === "scheduled")
                return "Visit scheduled";
            if (appointmentStatus === "cancelled") return "Visit cancelled, schedule again.";
        }

        // Special handling for payment step
        if (key === "payment") {
            if (state === "current") return "Processing payment in progress";
            if (state === "complete") return "Payment completed successfully";
        }

        const override = descriptions[key];
        if (!override) return DESCRIPTIONS[key][state];
        if (typeof override === "string") return override;
        if (override && typeof override === "object") {
            return override[state] || DESCRIPTIONS[key][state];
        }
        return DESCRIPTIONS[key][state];
    };

    return (
        <div className={className}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ordered.map((key) => {
                    // If deal is closed, override all states to "complete"
                    const originalState = steps?.[key] ?? "locked";
                    const state = isDealClosed ? "complete" : originalState;

                    const Icon = ICONS[key];
                    const title = TITLES[key];
                    const description = getDescription(key, state);

                    // Default button labels by state (base)
                    const baseLabel = {
                        inquiry:
                            state === "complete"
                                ? undefined
                                : state === "current"
                                    ? undefined
                                    : "Send Inquiry",
                        appointment:
                            state === "complete"
                                ? "View"
                                : state === "current"
                                    ? "View/Reschedule"
                                    : "Schedule Visit",
                        offer:
                            state === "complete"
                                ? showViewOnComplete
                                    ? "View Offer"
                                    : undefined
                                : "Make Offer",
                        payment:
                            state === "complete"
                                ? showViewOnComplete
                                    ? "View Receipt"
                                    : undefined
                                : state === "current"
                                    ? "Processing Payment" // Status text instead of button
                                    : "Proceed", // This will be removed for current state
                    }[key];

                    let actionLabel = labels[key] ?? baseLabel;
                    let rightBadge = null;
                    let isProcessingPayment = false;

                    /* --- Appointment logic for badges/labels --- */
                    const isApptStep = key === "appointment";
                    const isApptPendingish =
                        isApptStep &&
                        ["pending", "accepted", "scheduled"].includes(appointmentStatus);

                    if (isApptStep && state !== "locked") {
                        if (appointmentStatus === "pending") {
                            rightBadge = <SmallChip color="amber">Pending</SmallChip>;
                            if (state === "upcoming") actionLabel = "Schedule Visit";
                        } else if (
                            appointmentStatus === "accepted" ||
                            appointmentStatus === "scheduled"
                        ) {
                            rightBadge = <SmallChip color="green">Scheduled</SmallChip>;
                        } else if (appointmentStatus === "cancelled") {
                            rightBadge = <SmallChip color="rose">Cancelled</SmallChip>;
                            actionLabel = "Schedule Again";
                        }
                    }

                    /* --- Payment step special handling --- */
                    const isPaymentStep = key === "payment";
                    if (isPaymentStep && state === "current") {
                        // For payment step in current state, show only status text
                        actionLabel = "Processing Payment";
                        rightBadge = <SmallChip color="blue">Processing</SmallChip>;
                        isProcessingPayment = true;
                    } else if (isPaymentStep && state === "upcoming") {
                        // For payment step in upcoming state, remove the "Proceed" button
                        actionLabel = undefined;
                    }

                    // If deal is closed, remove all action labels (no buttons)
                    if (isDealClosed) {
                        actionLabel = undefined;
                    }

                    // Show action for all non-locked steps that have an action label
                    const shouldShowAction =
                        actionLabel &&
                        (state !== "locked" ||
                            (state === "complete" && showViewOnComplete) ||
                            isApptPendingish);

                    return (
                        <StepCard
                            key={key}
                            state={state}
                            title={title}
                            description={description}
                            Icon={Icon}
                            actionLabel={shouldShowAction ? actionLabel : undefined}
                            onAction={isProcessingPayment || isDealClosed ? undefined : onAction[key]} // No action for processing payment or closed deals
                            disabled={disabled || isProcessingPayment || isDealClosed}
                            rightBadge={rightBadge}
                            isProcessingPayment={isProcessingPayment}
                        />
                    );
                })}
            </div>

            {/* Show completion message for closed deals */}
            {isDealClosed && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium">
                            All steps completed successfully! The deal has been closed.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
