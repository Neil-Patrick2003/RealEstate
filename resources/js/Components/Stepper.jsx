// resources/js/Components/Stepper.jsx
import React from "react";
import {
    CheckCircle2,
    Lock,
    Send,
    CalendarClock,
    Handshake,
    CreditCard,
} from "lucide-react";

export const ICONS = {
    inquiry: Send,
    appointment: CalendarClock,
    offer: Handshake,
    payment: CreditCard,
};

export const TITLES = {
    inquiry: "Send Inquiry",
    appointment: "Schedule Visit",
    offer: "Offer Deal",
    payment: "Finalize Payment",
};

export const DESCRIPTIONS = {
    inquiry: {
        complete: "Inquiry accepted by seller/agent",
        current: "Waiting for seller response",
        upcoming: "Start by sending an inquiry",
        locked: "Blocked by previous step",
    },
    appointment: {
        complete: "Property visit completed",
        current: "Visit is scheduled/pending confirmation",
        upcoming: "Schedule your property visit",
        locked: "Unlocked when inquiry is accepted",
    },
    offer: {
        complete: "Offer finalized (accepted or rejected)",
        current: "Submit or revise your offer",
        upcoming: "Prepare your best offer",
        locked: "Unlocked after property visit is completed",
    },
    payment: {
        complete: "Deal closed and payment confirmed",
        current: "Payment link is available",
        upcoming: "Proceed to secured payment",
        locked: "Unlocked after offer acceptance",
    },
};

const STATE_STYLE = {
    // Current state changed from blue to amber/golden look
    complete:
        "bg-emerald-50 border-emerald-200 text-emerald-800 ring-1 ring-emerald-100",
    current:
        "bg-amber-50 border-amber-200 text-amber-800 ring-1 ring-amber-100", // PRIMARY: AMBER
    upcoming: "bg-white border-gray-200 text-gray-700 ring-1 ring-gray-100",
    locked: "bg-gray-50 border-gray-200 text-gray-400 ring-1 ring-gray-100",
};

const DOT_STYLE = {
    complete: "bg-emerald-600",
    current: "bg-amber-100", // PRIMARY DOT: AMBER
    upcoming: "bg-gray-400",
    locked: "bg-gray-300",
};

/** Small status chip (e.g., Pending / Scheduled) for appointment */
function SmallChip({ color = "gray", children }) {
    const map = {
        gray: "bg-gray-100 text-gray-700 ring-gray-200",
        amber: "bg-amber-100 text-amber-800 ring-amber-200",
        green: "bg-green-100 text-green-800 ring-green-200",
        rose: "bg-rose-100 text-rose-800 ring-rose-200",
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${map[color]}`}
        >
      {children}
    </span>
    );
}

/** One step card. */
function StepCard({
                      state,
                      title,
                      description,
                      Icon,
                      onAction,
                      actionLabel,
                      disabled,
                      rightBadge = null, // <SmallChip> or any inline node
                      isFirst,
                      isLast,
                  }) {
    const isLocked = state === "locked";
    const isComplete = state === "complete";
    const isCurrent = state === "current";

    // Action button styling - using amber for primary/current
    const actionClassName = isLocked
        ? "cursor-not-allowed bg-gray-100 text-gray-400"
        : isCurrent
            ? "bg-amber-600 text-white hover:bg-amber-700 font-semibold shadow-sm" // PRIMARY ACTION: AMBER
            : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50";

    return (
        <li className="relative flex-1 group">
            {/* Connector Line (Desktop Only) */}
            {!isLast && (
                <div
                    className={[
                        "absolute left-1/2 top-4 hidden h-0.5 w-1/2 translate-y-1/2 transform border-0 lg:block",
                        // Connector line starts at the middle of the current step and goes to the start of the next.
                        "group-odd:right-0 group-odd:left-auto group-even:left-0 group-even:right-auto",
                        "lg:group-[:nth-child(2n)]:left-1/2 lg:group-[:nth-child(2n)]:right-auto lg:group-[:nth-child(4n)]:right-0 lg:group-[:nth-child(4n)]:left-auto",
                        // Vertical connector for 2-column layout (sm screen)
                        "sm:absolute sm:left-1/2 sm:-bottom-3 sm:h-auto sm:w-0.5 sm:border-r sm:border-gray-200 sm:translate-x-0 sm:top-auto sm:z-0 lg:hidden",

                        // Horizontal line for desktop (lg screen)
                        "hidden lg:block absolute right-0 top-1/2 h-0.5 w-full -translate-y-1/2 border-t border-gray-200",
                        // Make line green for completed connection
                        (isComplete || isCurrent) && "border-emerald-300",
                    ].join(" ")}
                />
            )}

            <div
                className={[
                    "relative z-10 rounded-xl border p-4 transition h-full",
                    STATE_STYLE[state] || STATE_STYLE.upcoming,
                ].join(" ")}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-start gap-3">
                        <span
                            className={[
                                "mt-0.5 inline-flex h-2.5 w-2.5 shrink-0 rounded-full",
                                DOT_STYLE[state] || DOT_STYLE.upcoming,
                            ].join(" ")}
                            aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                {/* Icon color changed to amber for current step, gray otherwise */}
                                <Icon className={`h-4 w-4 ${isLocked ? 'text-gray-400' : isCurrent ? 'text-amber-600' : 'text-gray-700'}`} />
                                <h3 className="truncate text-sm font-semibold text-gray-900">{title}</h3>
                                {rightBadge}
                            </div>
                            <p className="mt-1 text-xs text-gray-600">{description}</p>
                        </div>
                        <div className="flex-shrink-0 pt-1">
                            {isComplete && (
                                <CheckCircle2
                                    className="h-5 w-5 text-emerald-600"
                                    aria-label="Completed"
                                />
                            )}
                            {isLocked && (
                                <Lock className="h-5 w-5 text-gray-400" aria-label="Locked" />
                            )}
                        </div>
                    </div>

                    {/* Action Button - bottom aligned */}
                    {actionLabel && (
                        <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex-grow flex items-end">
                            <button
                                onClick={onAction}
                                disabled={disabled || isLocked}
                                className={[
                                    "w-full inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition",
                                    actionClassName,
                                ].join(" ")}
                            >
                                {actionLabel}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
}


/**
 * Stepper
 */
export default function Stepper({
                                    steps,
                                    onAction = {},
                                    labels = {},
                                    descriptions = {},
                                    showViewOnComplete = true,
                                    disabled = false,
                                    className = "",
                                    appointmentStatus = "none",
                                }) {
    const ordered = ["inquiry", "appointment", "offer", "payment"];

    console.log(appointmentStatus);

    const getDescription = (key, state) => {
        // Special handling for appointment based on appointmentStatus
        if (key === "appointment") {
            if (appointmentStatus === "pending") return "Visit pending approval";
            if (appointmentStatus === "accepted" || appointmentStatus === "scheduled")
                return "Visit scheduled";
            if (appointmentStatus === "cancelled") return "Visit cancelled, schedule again.";
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
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ordered.map((key, index) => {
                    const state = steps?.[key] ?? "locked";
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
                                    ? "Pay Now"
                                    : "Proceed",
                    }[key];

                    let actionLabel = labels[key] ?? baseLabel;
                    let rightBadge = null;

                    /* --- Appointment logic for badges/labels --- */
                    const isApptStep = key === "appointment";
                    const isApptPendingish =
                        isApptStep &&
                        ["pending", "accepted", "scheduled"].includes(appointmentStatus);

                    if (isApptStep && state !== "locked") {
                        if (appointmentStatus === "pending") {
                            // Keep 'View/Reschedule' if current, or just 'View' if complete
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

                    // Show action for all non-locked steps that have an action label
                    const shouldShowAction =
                        actionLabel &&
                        (state !== "locked" ||
                            (state === "complete" && showViewOnComplete) ||
                            isApptPendingish); // Ensure we can still interact with an accepted/pending appointment

                    return (
                        <StepCard
                            key={key}
                            state={state}
                            title={title}
                            description={description}
                            Icon={Icon}
                            actionLabel={shouldShowAction ? actionLabel : undefined}
                            onAction={onAction[key]} // e.g., appointment: openScheduleModal
                            disabled={disabled}
                            rightBadge={rightBadge}
                            isFirst={index === 0}
                            isLast={index === ordered.length - 1}
                        />
                    );
                })}
            </ol>
        </div>
    );
}
