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

/* ---------- Constants you can also import elsewhere ---------- */
export const ICONS = {
    inquiry: Send,
    appointment: CalendarClock,
    offer: Handshake,
    payment: CreditCard,
};

export const TITLES = {
    inquiry: "Send Inquiry",
    appointment: "Appointment",
    offer: "Offer Deal",
    payment: "Payment",
};

export const DESCRIPTIONS = {
    inquiry: {
        complete: "Inquiry accepted",
        current: "Waiting for seller response",
        upcoming: "Start by sending an inquiry",
        locked: "Blocked by previous step",
    },
    appointment: {
        complete: "Visit completed",
        current: "Visit scheduled",
        upcoming: "Schedule a visit",
        locked: "Unlocked when inquiry is accepted",
    },
    offer: {
        complete: "Offer accepted",
        current: "Prepare your best offer",
        upcoming: "Make or revise an offer",
        locked: "Unlocked after inquiry accepted",
    },
    payment: {
        complete: "Payment confirmed",
        current: "Finish your payment",
        upcoming: "Proceed to payment",
        locked: "Unlocked after offer acceptance",
    },
};

const STATE_STYLE = {
    complete:
        "bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-100",
    current:
        "bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/10",
    upcoming: "bg-white border-gray-200 text-gray-700 ring-1 ring-gray-50",
    locked: "bg-gray-50 border-gray-200 text-gray-400 ring-1 ring-gray-50",
};

const DOT_STYLE = {
    complete: "bg-emerald-500",
    current: "bg-primary",
    upcoming: "bg-gray-300",
    locked: "bg-gray-300",
};

/**
 * One step card.
 */
function StepCard({
                      state,
                      title,
                      description,
                      Icon,
                      onAction,
                      actionLabel,
                      disabled,
                      lockedReason,
                  }) {
    const isLocked = state === "locked";
    const isComplete = state === "complete";
    const isCurrent = state === "current";

    return (
        <li className="relative flex-1">
            {/* connector line (desktop, visual only) */}
            <div className="absolute left-0 top-6 hidden h-0.5 w-full -translate-x-1/2 bg-gray-200 last:hidden sm:block" />
            <div
                className={[
                    "relative z-10 rounded-xl border p-4 sm:p-5 shadow-sm transition",
                    STATE_STYLE[state] || STATE_STYLE.upcoming,
                ].join(" ")}
            >
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
                            <Icon className="h-4 w-4" />
                            <h3 className="truncate text-sm font-semibold">{title}</h3>
                            {isComplete && (
                                <CheckCircle2
                                    className="h-4 w-4 text-emerald-600"
                                    aria-label="Completed"
                                />
                            )}
                            {isLocked && (
                                <Lock className="h-4 w-4 text-gray-400" aria-label="Locked" />
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-600">{description}</p>
                        {lockedReason && isLocked && (
                            <p className="mt-1 text-xs text-amber-700">
                                {lockedReason}
                            </p>
                        )}
                    </div>

                    {actionLabel && (
                        <button
                            onClick={onAction}
                            disabled={disabled || isLocked}
                            className={[
                                "ml-auto inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition",
                                isLocked
                                    ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                    : isCurrent
                                        ? "bg-primary text-white hover:bg-accent"
                                        : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50",
                            ].join(" ")}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}

/**
 * Stepper
 *
 * Props:
 * - steps: { inquiry: 'locked|upcoming|current|complete', appointment: ..., offer: ..., payment: ... }
 * - onAction?: { inquiry?: fn, appointment?: fn, offer?: fn, payment?: fn }
 * - labels?: { inquiry?: string, appointment?: string, offer?: string, payment?: string }
 * - descriptions?: optional overrides:
 *      1) { inquiry?: string, appointment?: string, ... }  (simple string per step)
 *      2) { inquiry?: { locked?: string, current?: string, ... }, ... } (per-state)
 * - lockedReasons?: { inquiry?: string, appointment?: string, offer?: string, payment?: string } additional hints shown only when locked
 * - showViewOnComplete?: boolean (default true for offer/payment, false for others)
 * - disabled?: boolean (disable all actions)
 * - className?: string
 */
export default function Stepper({
                                    steps,
                                    onAction = {},
                                    labels = {},
                                    descriptions = {},
                                    lockedReasons = {},
                                    showViewOnComplete = true,
                                    disabled = false,
                                    className = "",
                                }) {
    const ordered = ["inquiry", "appointment", "offer", "payment"];

    const getDescription = (key, state) => {
        const override = descriptions[key];
        if (!override) return DESCRIPTIONS[key][state];

        // string override per step
        if (typeof override === "string") return override;

        // per-state override object
        if (override && typeof override === "object") {
            return override[state] || DESCRIPTIONS[key][state];
        }

        return DESCRIPTIONS[key][state];
    };

    return (
        <div
            className={[
                "rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm",
                className,
            ].join(" ")}
        >
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ordered.map((key) => {
                    const state = steps?.[key] ?? "locked";
                    const Icon = ICONS[key];
                    const title = TITLES[key];
                    const description = getDescription(key, state);

                    // Default button labels by state
                    const defaultLabel = {
                        // 🔧 inquiry: no action when 'current' (pending), only show "Send" when 'upcoming'
                        inquiry:
                            state === "complete"
                                ? undefined
                                : state === "current"
                                    ? undefined     // <-- removed "Resend"
                                    : "Send",

                        appointment:
                            state === "complete" ? "View" : state === "current" ? "View" : "Schedule",

                        offer:
                            state === "complete" ? (showViewOnComplete ? "View" : undefined) : "Make Offer",

                        payment:
                            state === "complete"
                                ? (showViewOnComplete ? "View" : undefined)
                                : state === "current"
                                    ? "Pay Now"
                                    : "Proceed",
                    }[key];

                    // Show action when not locked, or when complete & showViewOnComplete
                    const shouldShowAction =
                        state !== "locked" ||
                        (state === "complete" && showViewOnComplete);

                    const actionLabel =
                        labels[key] ?? (shouldShowAction ? defaultLabel : undefined);

                    return (
                        <StepCard
                            key={key}
                            state={state}
                            title={title}
                            description={description}
                            Icon={Icon}
                            actionLabel={actionLabel}
                            onAction={onAction[key]}
                            disabled={disabled}
                            lockedReason={lockedReasons[key]}
                        />
                    );
                })}
            </ol>
        </div>
    );
}
