import {
    CalendarDays,
    Info,
    AlertTriangle,
    CheckCircle2,
    Handshake,
    CreditCard,
} from "lucide-react";



function NoteRow({ icon: Icon, tone = "info", title, children, action = null }) {
    const toneMap = {
        info:    "border-blue-200 bg-blue-50 text-blue-900",
        warn:    "border-amber-200 bg-amber-50 text-amber-900",
        danger:  "border-rose-200 bg-rose-50 text-rose-900",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    };
    const iconMap = {
        info: "text-blue-600",
        warn: "text-amber-600",
        danger: "text-rose-600",
        success: "text-emerald-600",
    };

    return (
        <div className={`rounded-xl border px-4 py-3 ${toneMap[tone]}`}>
            <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 ${iconMap[tone]}`} />
                <div className="flex-1">
                    {title && <div className="text-sm font-semibold">{title}</div>}
                    <div className="text-sm">{children}</div>
                    {action}
                </div>
            </div>
        </div>
    );
}

/** Builds a stack of friendly, contextual notes below the Stepper */
function StepperNotes({
                          iStatus,         // inquiry status
                          apptStatus,      // appointment status
                          deal,            // deal object or null
                          dealStatus,      // deal status
                          onResched,       // fn
                          onSchedule,      // fn
                          onOffer,         // fn (open deal form/details)
                          onPay,           // fn
                      }) {
    const notes = [];


    console.log(apptStatus);



    // Inquiry stage
    if (iStatus === "pending") {
        notes.push({
            tone: "info",
            icon: Info,
            title: "Inquiry sent — waiting for agent",
            body: <>Your inquiry is pending. Once accepted, you can schedule a visit.</>,
        });
    }
    if (iStatus === "accepted" && (apptStatus === "none" || apptStatus === "cancelled")) {
        notes.push({
            tone: "warn",
            icon: CalendarDays,
            title: "Next step: schedule your visit",
            body: (
                <>
                    Your inquiry is accepted. Pick a date and time for a property tour so we can unlock the
                    offer step.
                </>
            ),
            action: (
                <div className="mt-2">
                    <button
                        onClick={onSchedule}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                        <CalendarDays className="h-4 w-4" />
                        Schedule Visit
                    </button>
                </div>
            ),
        });
    }
    if (iStatus === "accepted" && (apptStatus === "pending" || apptStatus === "accepted" || apptStatus === "scheduled")) {
        notes.push({
            tone: "info",
            icon: CalendarDays,
            title: "Visit in progress",
            body: <>Your visit is {apptStatus}. You can reschedule if needed.</>,
            action: (
                <div className="mt-2">
                    <button
                        onClick={onResched}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        <CalendarDays className="h-4 w-4" />
                        Reschedule Visit
                    </button>
                </div>
            ),
        });
    }
    if (apptStatus === "done" && !deal) {
        notes.push({
            tone: "warn",
            icon: Handshake,
            title: "Ready to make an offer?",
            body: <>Your visit is done. Submit your offer to proceed to payment.</>,
            action: (
                <div className="mt-2">
                    <button
                        onClick={onOffer}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                        <Handshake className="h-4 w-4" />
                        Make Offer
                    </button>
                </div>
            ),
        });
    }

    // Deal stage
    if (deal && (dealStatus === "pending" || dealStatus === "countered")) {
        notes.push({
            tone: "info",
            icon: Handshake,
            title: "Offer pending",
            body: <>Your offer is under review. You can revise or wait for a response.</>,
        });
    }
    if (dealStatus === "accepted") {
        notes.push({
            tone: "success",
            icon: CheckCircle2,
            title: "Offer accepted — proceed to payment",
            body: <>Great news! Finish your payment to move forward with closing.</>,
            action: (
                <div className="mt-2">
                    <button
                        onClick={onPay}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent"
                    >
                        <CreditCard className="h-4 w-4" />
                        Pay Now
                    </button>
                </div>
            ),
        });
    }
    if (dealStatus === "rejected") {
        notes.push({
            tone: "danger",
            icon: AlertTriangle,
            title: "Offer declined",
            body: <>This offer was declined. You can submit a new one or message the agent for guidance.</>,
        });
    }

    if (!notes.length) return null;

    return (
        <div className="mt-4 space-y-3">
            {notes.map((n, idx) => (
                <NoteRow
                    key={idx}
                    icon={n.icon}
                    tone={n.tone}
                    title={n.title}
                    action={n.action || null}
                >
                    {n.body}
                </NoteRow>
            ))}
        </div>
    );
}

export default StepperNotes;
