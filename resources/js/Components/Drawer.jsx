import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Drawer({ open, setOpen, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [setOpen]);

    const handleOutsideClick = (e) => {
        if (e.target.id === "drawer-overlay") {
            setOpen(false);
        }
    };

    return (
        <div
            id="drawer-overlay"
            onClick={handleOutsideClick}
            className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
            {/* Drawer Panel */}
            <div
                className={`fixed right-0 top-0 h-[calc(100%-64px)] w-full sm:w-[450px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
                style={{ marginTop: "64px" }} // Topbar offset
            >
                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-[calc(100%+12px)] z-50 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Full Height Flex Column with Scrollable Content */}
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Fixed Header */}
                    <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-white">
                        <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{title}</h2>
                    </div>

                    {/* Scrollable Main Content */}
                    <div className="overflow-y-auto flex-1 px-6 pb-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
