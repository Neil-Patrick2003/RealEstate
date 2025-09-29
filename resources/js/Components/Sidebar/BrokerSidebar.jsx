import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, usePage } from "@inertiajs/react";
import logo from "../../../assets/framer_logo.png";

// Lucide icons (consistent names, no FA version drift)
import {
    Home,
    MapPinned,
    Users,
    Mail,
    CalendarDays,
    ReceiptText,
    Handshake,
    Building2,
    ChevronDown,
} from "lucide-react";

const menus = [
    { name: "Dashboard", Icon: Home, path: "/broker/dashboard" },
    { name: "Properties", Icon: MapPinned, path: "/broker/properties" },
    { name: "Agents", Icon: Users, path: "/broker/agents" },
    { name: "Inquiries", Icon: Mail, path: "/broker/inquiries" },
    { name: "Tripping", Icon: CalendarDays, path: "/broker/trippings" },
    { name: "Transactions", Icon: ReceiptText, path: "/broker/transactions" },
    { name: "Deals", Icon: Handshake, path: "/broker/deals" },
    { name: "Partners", Icon: Building2, path: "/broker/partners" },
];

const cx = (...c) => c.filter(Boolean).join(" ");

const sidebarAnim = {
    open: { width: "18rem", transition: { duration: 0.25, ease: "easeInOut" } },
    closed: { width: "5rem", transition: { duration: 0.25, ease: "easeInOut" } },
};
const subAnim = {
    enter: { height: "auto", opacity: 1, overflow: "hidden", transition: { duration: 0.2 } },
    exit: { height: 0, opacity: 0, overflow: "hidden", transition: { duration: 0.2 } },
};

const BrokerSlider = ({ isOpen, setIsOpen }) => {
    const { url } = usePage();
    const [openIdx, setOpenIdx] = useState(null);

    // persist collapse
    useEffect(() => {
        const saved = localStorage.getItem("brokerSidebarOpen");
        if (saved !== null) setIsOpen(saved === "1");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        localStorage.setItem("brokerSidebarOpen", isOpen ? "1" : "0");
    }, [isOpen]);

    // auto-open submenu for active route (if you add subMenu later)
    useEffect(() => {
        // no submenus defined now; keep hook for future
    }, [url]);

    const isActivePath = useCallback(
        (path, subMenu) => url.startsWith(path) || (subMenu?.some((s) => url.startsWith(s.path)) ?? false),
        [url]
    );

    const Tip = ({ children, label }) => (
        <div className="relative group">
            {children}
            <span
                className={cx(
                    "pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2",
                    "whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow-lg opacity-0",
                    "group-hover:opacity-100 transition-opacity",
                    isOpen && "hidden"
                )}
            >
        {label}
      </span>
        </div>
    );

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/25 md:hidden z-[998]" onClick={() => setIsOpen(false)} />}

            <motion.nav
                aria-label="Broker sidebar"
                className="bg-white shadow-sm ring-1 ring-gray-100 h-screen z-[999] overflow-hidden md:relative fixed"
                variants={sidebarAnim}
                animate={isOpen ? "open" : "closed"}
                initial={false}
            >
                {/* header */}
                <div className={cx("flex items-center border-b border-gray-100 py-3", isOpen ? "px-4 gap-3" : "px-4 justify-center")}>
                    <Link href="/" className="flex items-center gap-2 min-w-0">
                        <img src={logo} width={36} height={36} alt="MJVI Realty" className="shrink-0 rounded" />
                        {isOpen && <span className="truncate text-base font-bold text-primary">MJVI Realty</span>}
                    </Link>
                </div>

                {isOpen && (
                    <p className="px-4 pt-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Navigation</p>
                )}

                {/* menu */}
                <ul className="px-2 pt-3 pb-24 space-y-1 text-sm font-medium     h-[calc(100vh-120px)]">
                    {menus.map(({ name, Icon, path, subMenu }, i) => {
                        const active = isActivePath(path, subMenu);
                        const baseItem = "relative flex items-center gap-3 py-2.5 rounded-lg transition-colors";
                        const basePad = isOpen ? "px-3" : "px-4";
                        const baseColors = active
                            ? "bg-green-50 text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary";

                        return (
                            <li key={name} className="relative">
                                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-primary rounded-r" />}
                                <Tip label={name}>
                                    <Link href={path} className={cx(baseItem, basePad, baseColors)}>
                                        <Icon className="w-5 h-5 shrink-0" aria-hidden />
                                        {isOpen && <span className="truncate">{name}</span>}
                                    </Link>
                                </Tip>
                            </li>
                        );
                    })}
                </ul>

                {/* mobile collapse */}
                <div className="absolute bottom-3 left-0 right-0 px-3 md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2"
                    >
                        <ChevronDown className={cx("transition-transform", isOpen ? "rotate-90" : "-rotate-90")} size={18} />
                        {isOpen ? "Collapse" : "Expand"}
                    </button>
                </div>
            </motion.nav>
        </>
    );
};

export default BrokerSlider;
