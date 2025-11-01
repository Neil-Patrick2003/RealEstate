/* ---------------- MODAL + CERTIFICATE - AMBER THEME (Fixed Logo Import) ---------------- */

import Modal from "@/Components/Modal"; // adjust path if needed

// 1. FIX: Use a default import for the PNG file. It resolves to the image URL (a string).
import LogoSrc from "../../../../assets/framer_logo.png";

export default function TransactionReviewModal({ open, onClose, tx }) {
    if (!open || !tx) return null;

    // Print only the certificate block
    const printOnlyCertificateCSS = `
    @media print {
      body * { visibility: hidden !important; }
      #certificate-root, #certificate-root * { visibility: visible !important; }
      /* Ensure the certificate fills the page for printing */
      #certificate-root { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 24px; box-shadow: none !important; }
    }
  `;

    const phpLocal = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
    const created = tx.created_at ? new Date(tx.created_at).toLocaleString() : "-";

    return (
        <>
            <style>{printOnlyCertificateCSS}</style>

            {/* Modal - Removed border, rely on shadow */}
            <Modal show={open} maxWidth="4xl" onClose={onClose} contentClasses="bg-white rounded-xl shadow-2xl">
                {/* Header - Reduced padding on small screens: px-4 */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-gray-100 rounded-t-xl">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Transaction Review</h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                            Transaction **#{tx.id}** — <span className="font-semibold text-green-600">{tx.status}</span>
                        </p>
                    </div>
                    {/* Button Group - Reduced gap on small screens: gap-2 */}
                    <div className="flex gap-2 sm:gap-3">
                        {/* Secondary Button - Slightly smaller text/padding on small screens */}
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition"
                            type="button"
                        >
                            Close
                        </button>
                        {/* Primary Button - Slightly smaller text/padding on small screens */}
                        <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow-md shadow-amber-200"
                            type="button"
                        >
                            🖨️ Print
                        </button>
                    </div>
                </div>

                {/* Body - Reduced padding on small screens: p-4 */}
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Quick Overview - Soft gray background, no border */}
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-inner">
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800 tracking-tight">General Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 sm:gap-y-5 text-sm">
                            <KeyVal k="Created" v={created} />
                            <KeyVal k="Status" v={tx.status} isStatus={true} />
                            <KeyVal k="Reference No." v={tx.reference_no || "-"} />

                            <KeyVal k="Buyer" v={tx.buyer?.name || "-"} />
                            <KeyVal k="Email" v={tx.buyer?.email || "-"} />
                            <KeyVal k="Contact" v={tx.buyer?.contact_number || "-"} />

                            <KeyVal k="Property" v={tx.property?.title || `#${tx.property_id || "-"}`} />
                            <KeyVal k="Address" v={tx.property?.address || "-"} isWide={true} />
                        </div>
                    </div>

                    {/* Commercials - Clean white card with shadow, more emphasis on total/balance */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800 tracking-tight">Financial Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 sm:gap-y-5 text-sm">
                            <KeyVal k="Base Price" v={phpLocal.format(Number(tx.base_price || 0))} />
                            <KeyVal k="Discount" v={phpLocal.format(Number(tx.discount_amount || 0))} />
                            <KeyVal k="Fees" v={phpLocal.format(Number(tx.fees_amount || 0))} />

                            <KeyVal k="Reservation" v={phpLocal.format(Number(tx.reservation_amount || 0))} />
                            <KeyVal k="Downpayment" v={phpLocal.format(Number(tx.downpayment_amount || 0))} />
                            <KeyVal k="Mode of Payment" v={tx.financing || "-"} />
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {/* Emphasized Fields - Amber color for financial focus */}
                            <KeyVal k="Total Contract Price (TCP)" v={phpLocal.format(Number(tx.tcp || 0))} isEmphasis={true} />
                            <KeyVal k="Balance Due" v={phpLocal.format(Number(tx.balance_amount || 0))} isBalance={true} />
                        </div>
                    </div>

                    {tx.remarks ? (
                        <div className="text-sm p-4 bg-amber-50 rounded-xl shadow-inner">
                            <div className="text-amber-800 font-bold mb-1">📝 Remarks</div>
                            <div className="text-amber-700 whitespace-pre-wrap">{tx.remarks}</div>
                        </div>
                    ) : null}

                    {/* Printable Certificate - Reduced padding on small screens: p-4 */}
                    <div id="certificate-root" className="bg-white rounded-xl p-4 sm:p-8 shadow-xl">
                        <Certificate
                            tx={tx}
                            company={{
                                name: "MJVI Realty Corporation",
                                address: "Unit 123, Sample Building, Makati City, Philippines",
                                contact: "(+63) 912-345-6789 • hello@mjvirealty.ph",
                                tagline: "Trusted Properties. Seamless Transactions.",
                            }}
                            LogoSrc={LogoSrc} // 2. Pass the URL string as a prop named LogoSrc
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}

// KeyVal component (Unchanged)
function KeyVal({ k, v, isEmphasis = false, isBalance = false, isStatus = false, isWide = false }) {
    let keyClasses = "text-gray-500 text-xs font-semibold uppercase tracking-wider";
    let valueClasses = "font-bold text-base text-gray-800 mt-1";

    if (isEmphasis) {
        keyClasses = "text-amber-600 text-sm font-extrabold uppercase tracking-wide";
        valueClasses = "font-extrabold text-xl sm:text-2xl text-amber-700 mt-1";
    }
    if (isBalance) {
        keyClasses = "text-red-600 text-sm font-extrabold uppercase tracking-wide";
        valueClasses = "font-extrabold text-xl sm:text-2xl text-red-700 mt-1";
    }
    if (isStatus) {
        valueClasses = "font-bold text-base text-green-600 mt-1";
    }

    return (
        <div className={`flex flex-col ${isWide ? 'md:col-span-2' : ''}`}>
            <span className={keyClasses}>{k}</span>
            <span className={valueClasses}>{v}</span>
        </div>
    );
}

/* ---------------- CERTIFICATE COMPONENT - AMBER THEME (FIXED LOGO RENDERING) ---------------- */

// 3. Accept the LogoSrc string prop
function Certificate({ tx, company, LogoSrc }) {
    const phpLocal = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="text-sm leading-relaxed font-serif text-gray-800 p-2 sm:p-4">
            {/* Letterhead - Elegant and spaced out */}
            <div className="text-center mb-8 sm:mb-10 flex flex-col items-center">
                {/* 4. Render as an <img> tag, using the prop for the src attribute */}
                {LogoSrc && (
                    <img
                        src={LogoSrc} // Use the URL string here
                        alt={`${company?.name || "Company"} Logo`}
                        className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 object-contain"
                    />
                )}

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-700">TRANSACTION CERTIFICATE</h1>
                {company?.name && <p className="text-neutral-900 font-bold mt-1 text-base sm:text-lg">{company.name}</p>}
                {company?.tagline && <p className="text-neutral-600 text-xs italic mt-0.5">{company.tagline}</p>}
                {(company?.address || company?.contact) && (
                    <p className="text-neutral-500 text-xs mt-2">
                        {company.address}{company.address && company.contact ? " | " : ""}{company.contact}
                    </p>
                )}
                {/* Thicker amber separator */}
                <div className="w-12 sm:w-16 h-1 bg-amber-500 mt-3 sm:mt-4 mx-auto"></div>
                <p className="text-neutral-600 text-xs mt-3">Generated on **{today}**</p>
            </div>

            {/* Sections (Unchanged) */}
            <div className="space-y-6 sm:space-y-8">
                <Section title="Transaction Details" isPrimary={true}>
                    <Row label="Transaction ID" value={`#${tx.id}`} />
                    <Row label="Status" value={<span className="font-bold text-green-700">{tx.status}</span>} />
                    <Row label="Created At" value={tx.created_at ? new Date(tx.created_at).toLocaleString() : "-"} />
                    <Row label="Reference No." value={tx.reference_no || "-"} />
                </Section>

                <Section title="Parties Involved">
                    <Row label="Buyer" value={tx.buyer?.name || "-"} />
                    <Row label="Buyer Email" value={tx.buyer?.email || "-"} />
                    <Row label="Agent" value={tx.agent.name || "-"} />
                </Section>

                <Section title="Property Details">
                    <Row label="Title" value={tx.property?.title || `#${tx.property_id || "-"}`} />
                    <Row label="Address" value={tx.property?.address || "-"} />
                </Section>

                <Section title="Financial Summary" isHighlighted={true}>
                    <Row label="Base Price" value={phpLocal.format(Number(tx.base_price || 0))} />
                    <Row label="Discount" value={phpLocal.format(Number(tx.discount_amount || 0))} isNegative={true} />
                    <Row label="Fees" value={phpLocal.format(Number(tx.fees_amount || 0))} />
                    <div className="h-px bg-gray-200 my-2"></div>
                    <Row label="**Total Contract Price (TCP)**" value={phpLocal.format(Number(tx.tcp || 0))} isTotal={true} />
                    <Row label="Reservation Paid" value={phpLocal.format(Number(tx.reservation_amount || 0))} isPaid={true} />
                    <Row label="Downpayment Paid" value={phpLocal.format(Number(tx.downpayment_amount || 0))} isPaid={true} />
                    <div className="h-px bg-gray-200 my-2"></div>
                    <Row label="**Balance Due**" value={phpLocal.format(Number(tx.balance_amount || 0))} isBalance={true} />
                    <Row label="Financing" value={tx.financing || "-"} />
                    <Row label="Mode of Payment" value={tx.mode_of_payment || "-"} />
                </Section>

                {tx.remarks ? (
                    <Section title="Additional Notes">
                        <p className="whitespace-pre-wrap text-neutral-700 border-l-4 border-amber-300 pl-4 py-1 bg-amber-50 rounded-r-md">
                            {tx.remarks}
                        </p>
                    </Section>
                ) : null}

                <section className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                    <SigBlock label="Buyer Signature" name={tx.buyer?.name || "Buyer"} />
                    <SigBlock label="Agent Signature" name={tx.agent?.name || "Agent"} />
                </section>
            </div>
        </div>
    );
}

// Section component (Unchanged)
function Section({ title, children, isPrimary = false, isHighlighted = false }) {
    const titleClasses = isPrimary
        ? "text-base sm:text-lg font-extrabold pb-1 border-b-2 border-amber-600 text-amber-700 tracking-tight"
        : "text-base sm:text-lg font-bold pb-1 border-b border-gray-300 text-gray-800 tracking-tight";

    const sectionClasses = isHighlighted ? "bg-gray-50 p-4 rounded-lg shadow-sm" : "py-2";

    return (
        <section className={sectionClasses}>
            <h3 className={titleClasses}>{title}</h3>
            <div className="space-y-2 mt-3">{children}</div>
        </section>
    );
}

// Row component (Unchanged)
function Row({ label, value, isTotal = false, isBalance = false, isPaid = false, isNegative = false }) {
    let labelClasses = "text-neutral-600 font-medium";
    let valueClasses = "font-medium text-right";

    if (isTotal) {
        labelClasses = "font-bold text-amber-700";
        valueClasses = "text-lg sm:text-xl font-extrabold text-amber-700";
    }
    else if (isBalance) {
        labelClasses = "font-bold text-red-600";
        valueClasses = "text-lg sm:text-xl font-extrabold text-red-700";
    }
    else if (isPaid) valueClasses += " text-green-700 font-semibold";
    else if (isNegative) valueClasses += " text-red-600 font-semibold";
    else valueClasses += " text-gray-900";

    return (
        <div className="flex justify-between py-1 items-center">
            <span className={labelClasses}>{label}</span>
            <span className={valueClasses}>{value}</span>
        </div>
    );
}

// SigBlock component (Unchanged)
function SigBlock({ label, name }) {
    return (
        <div className="p-3 flex flex-col justify-end">
            <div className="border-t border-gray-400 mt-6 pt-2 text-center">
                <div className="font-semibold text-base text-gray-800">{name}</div>
                <div className="text-xs text-neutral-500 italic">{label}</div>
            </div>
        </div>
    );
}
