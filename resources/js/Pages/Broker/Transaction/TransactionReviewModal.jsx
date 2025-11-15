/* ---------------- MODAL + PROOF OF TRANSACTION - AMBER THEME (Balanced Layout) ---------------- */

import Modal from "@/Components/Modal";
import React, { useRef } from "react";

// FIX: Use a default import for the PNG file. It resolves to the image URL (a string).
import LogoSrc from "../../../../assets/framer_logo.png";

export default function TransactionReviewModal({ open, onClose, tx }) {
    if (!open || !tx) return null;

    const certificateRef = useRef(null);

    // Optimized Print CSS for increased space and readability (11px base font)
    const printOnlyCertificateCSS = `
    @media print {
      body * {
        visibility: hidden !important;
        overflow: visible !important;
        height: auto !important;
      }

      #certificate-root, #certificate-root * {
        visibility: visible !important;
      }

      /* Crucial: Full width, no print margins, padding kept minimal */
      #certificate-root {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        min-height: 100vh;
        margin: 0 !important;
        padding: 18px !important; /* Slightly more page margin */
        box-shadow: none !important;
        background-color: white !important;
        font-family: sans-serif;
      }

      /* Increase print text size for readability */
      #certificate-root { font-size: 11px !important; }
      #certificate-root h1 { font-size: 19px !important; }
      #certificate-root h3 { font-size: 14px !important; }

      .print-avoid-break { page-break-inside: avoid; }
      .certificate-watermark { display: none !important; }
      .sig-block .pt-1 { padding-top: 4px !important; } /* Better space for signatures */
      .section-proof { padding-bottom: 8px !important; } /* More space between sections */
    }
  `;

    const phpLocal = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
    const created = tx.created_at ? new Date(tx.created_at).toLocaleString() : "-";

    const handlePrint = () => {
        const printContents = certificateRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = `
            <style>${printOnlyCertificateCSS}</style>
            <div id="certificate-root" style="height: auto; width: 100%;">
                ${printContents}
            </div>
        `;

        window.print();

        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    return (
        <>
            <style>{printOnlyCertificateCSS}</style>

            <Modal show={open} maxWidth="4xl" onClose={onClose} contentClasses="bg-white rounded-xl shadow-2xl">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-gray-100 rounded-t-xl">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Transaction Review</h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                            Transaction **#{tx.id}** — <span className="font-semibold text-green-600">{tx.status}</span>
                        </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition"
                            type="button"
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow-md shadow-amber-200"
                            type="button"
                        >
                            🖨️ Print Proof
                        </button>
                    </div>
                </div>

                {/* Modal Body (Screen View) */}
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-h-[80vh] overflow-y-auto">

                    {/* ... (Review Blocks kept identical) ... */}
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


                    {/* Printable Proof of Transaction */}
                    <div id="certificate-root" ref={certificateRef} className="bg-white p-3 sm:p-6">
                        <ProofOfTransaction
                            tx={tx}

                            company={{

                                name: "MJVI Realty",

                                address: "Brgy 6, P. Hugo St. Nasugbu, Batangas, Philippines",

                                contact: "(+63) 912-345-6789 • mjvi-realty@gmail.com",

                            }}
                            LogoSrc={LogoSrc}
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

/* ---------------- PROOF OF TRANSACTION COMPONENT (BALANCED LAYOUT) ---------------- */

function ProofOfTransaction({ tx, company, LogoSrc }) {
    const phpLocal = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="text-xs leading-snug font-sans text-gray-800 p-0">

            {/* Header - Simple and business-like */}
            <div className="text-center mb-6 pt-1 flex flex-col items-center print-avoid-break border-b border-gray-300">
                {LogoSrc && (
                    <img
                        src={LogoSrc}
                        alt={`${company?.name || "Company"} Logo`}
                        className="w-9 h-9 mb-1 object-contain"
                    />
                )}

                <h1 className="text-lg font-bold tracking-tight text-gray-900 uppercase">Proof of Transaction Details</h1>
                {company?.name && <p className="text-neutral-900 font-semibold mt-0.5 text-xs">{company.name}</p>}
                {(company?.address || company?.contact) && (
                    <p className="text-neutral-600 text-[11px] mt-0.5 mb-2">
                        {company.address}{company.address && company.contact ? " | " : ""}{company.contact}
                    </p>
                )}
                <div className="w-full h-0.5 bg-amber-500 mb-2 mx-auto"></div>
                <p className="text-neutral-500 text-[10px] pb-1">Date Generated: **{today}** | ID: **#{tx.id}**</p>
            </div>

            {/* Sections - Tighter but with slightly more padding */}
            <div className="space-y-4">

                <SectionProof title="CORE TRANSACTION DATA" isPrimary={true} className="print-avoid-break section-proof">
                    <RowProof label="Transaction Status" value={<span className="font-extrabold text-green-700">{tx.status}</span>} isBold={true} />
                    <RowProof label="Created Date" value={tx.created_at ? new Date(tx.created_at).toLocaleString() : "-"} />
                    <RowProof label="Reference Number" value={tx.reference_no || "-"} isBold={true} />
                    <RowProof label="Property Title" value={tx.property?.title || `#${tx.property_id || "-"}`} isBold={true} />
                </SectionProof>

                <SectionProof title="PARTIES & PROPERTY" className="print-avoid-break section-proof">
                    <RowProof label="Buyer Name" value={tx.buyer?.name || "-"} isBold={true} />
                    <RowProof label="Buyer Email" value={tx.buyer?.email || "-"} />
                    <RowProof label="Agent/Broker" value={tx.agent?.name || "-"} isBold={true} />
                    <RowProof label="Property Address" value={tx.property?.address || "-"} isMuted={true} />
                </SectionProof>

                <SectionProof title="FINANCIAL BREAKDOWN" isHighlighted={true} className="print-avoid-break section-proof">
                    <RowProof label="Base Price" value={phpLocal.format(Number(tx.base_price || 0))} />
                    <RowProof label="Discount" value={phpLocal.format(Number(tx.discount_amount || 0))} isNegative={true} />
                    <RowProof label="Fees" value={phpLocal.format(Number(tx.fees_amount || 0))} />
                    <div className="h-px bg-gray-300 my-1.5"></div> {/* Increased margin slightly */}

                    <RowProof label="TOTAL CONTRACT PRICE (TCP)" value={phpLocal.format(Number(tx.tcp || 0))} isTotal={true} />
                    <RowProof label="Total Payments (Reservation + DP)" value={phpLocal.format(Number(tx.reservation_amount || 0) + Number(tx.downpayment_amount || 0))} isPaid={true} />

                    <div className="h-px bg-gray-400 my-1.5"></div> {/* Increased margin slightly */}
                    <RowProof label="**BALANCE DUE**" value={phpLocal.format(Number(tx.balance_amount || 0))} isBalance={true} />
                    <RowProof label="Financing Mode" value={tx.financing || "-"} />
                    <RowProof label="Payment Terms" value={tx.mode_of_payment || "-"} />
                </SectionProof>

                {tx.remarks ? (
                    <SectionProof title="NOTES" className="print-avoid-break section-proof">
                        <p className="whitespace-pre-wrap text-neutral-700 text-[11px] border-l-2 border-amber-400 pl-3 py-1 bg-amber-50/50">
                            {tx.remarks}
                        </p>
                    </SectionProof>
                ) : null}

                {/* Signature Block - Increased space */}
                <section className="mt-8 grid grid-cols-2 gap-12 print-avoid-break">
                    <SigBlockProof label="BUYER ACKNOWLEDGMENT" name={tx.buyer?.name || "Buyer"} />
                    <SigBlockProof label="COMPANY AUTHORIZATION" name={tx.agent?.name || "Agent"} />
                </section>
            </div>
        </div>
    );
}

// Section component (Streamlined for data focus - increased padding)
function SectionProof({ title, children, isPrimary = false, isHighlighted = false, className = '' }) {
    const titleClasses = isPrimary
        ? "text-xs font-extrabold uppercase pb-0.5 border-b-2 border-amber-600 text-amber-700 tracking-wider"
        : "text-[11px] font-bold uppercase pb-0.5 border-b border-gray-300 text-gray-700 tracking-wider";

    // Increased padding and added border for section separation
    const sectionClasses = isHighlighted ? "p-3 border border-amber-200 bg-amber-50/50" : "p-1.5 border-b border-gray-100";

    return (
        <section className={`${sectionClasses} ${className}`}>
            <h3 className={titleClasses}>{title}</h3>
            <div className="space-y-1 mt-2">{children}</div> {/* Increased space-y and margin */}
        </section>
    );
}

// Row component (Streamlined for data focus - increased padding)
function RowProof({ label, value, isTotal = false, isBalance = false, isPaid = false, isNegative = false, isBold = false, isMuted = false }) {
    let labelClasses = "text-neutral-600 font-medium";
    let valueClasses = "font-medium text-right";

    if (isTotal) {
        labelClasses = "font-extrabold text-amber-700 text-xs";
        valueClasses = "text-sm font-extrabold text-amber-800";
    }
    else if (isBalance) {
        labelClasses = "font-extrabold text-red-600 text-xs";
        valueClasses = "text-sm font-extrabold text-red-700";
    }
    else if (isPaid) valueClasses += " text-green-700 font-semibold";
    else if (isNegative) valueClasses += " text-red-600 font-semibold";
    else if (isBold) valueClasses += " text-gray-900 font-semibold";
    else if (isMuted) valueClasses += " text-gray-500 text-[11px] font-light italic";
    else valueClasses += " text-gray-800";

    return (
        <div className="flex justify-between py-1 items-center"> {/* Increased vertical padding */}
            <span className={labelClasses}>{label}</span>
            <span className={valueClasses}>{value}</span>
        </div>
    );
}

// SigBlock component (Simplified for functional proof - increased padding)
function SigBlockProof({ label, name }) {
    return (
        <div className="p-0 flex flex-col justify-end">
            <div className="border-t border-gray-500 mt-4 pt-2 text-center sig-block">
                <div className="font-semibold text-xs text-gray-900 tracking-wide">{name}</div>
                <div className="text-[10px] text-neutral-500 uppercase mt-0.5">{label}</div>
            </div>
        </div>
    );
}
