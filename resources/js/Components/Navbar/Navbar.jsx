import React, { createContext, useContext, useState } from "react";
import { Link, usePage } from "@inertiajs/react"; // ✅ for Inertia navigation
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

export const SidebarContext = createContext();

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <aside
            className={`relative h-screen transition-all duration-300 ${
                expanded ? "w-72" : "w-20"
            }`}
        >
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                {/* Header */}
                <div className="p-4 mb-6 flex items-center">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQemcyueB0yW6ah96fHEyuGB5O1ydYyequTFQ&s"
                        alt="Logo"
                        className="h-10 w-10 border"
                    />
                    <span
                        className={`ml-3 text-xl font-bold text-emerald-700 transition-all duration-300 ${
                            expanded ? "opacity-100" : "opacity-0 hidden overflow-hidden"
                        }`}
                    >
            Clover Bank
          </span>
                </div>

                {/* Toggle button */}
                <button
                    className={`absolute hidden md:block border p-1.5 rounded-full bg-primary text-white transition-all ${
                        expanded ? "left-[268px]" : "left-16"
                    } top-3 shadow-lg hover:bg-emerald-700`}
                    onClick={() => setExpanded((prev) => !prev)}
                >
                    {expanded ? <ChevronLeft /> : <ChevronRight />}
                </button>

                {/* Context Provider */}
                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3 text-sm space-y-2">{children}</ul>
                </SidebarContext.Provider>

                {/* Footer */}
                <div className="border-t flex items-center p-3">
                    <img
                        src="https://i.pravatar.cc/300"
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                        className={`flex justify-between items-center overflow-hidden transition-all duration-300 ${
                            expanded ? "w-52 ml-3" : "w-0"
                        }`}
                    >
                        <div className="leading-4">
                            <h4 className="font-semibold">John Doe</h4>
                            <span className="text-sm text-gray-600">johndoe@gmail.com</span>
                        </div>
                        <MoreVertical size={20} className="ml-2 text-gray-500" />
                    </div>
                </div>
            </nav>
        </aside>
    );
}

export function SidebarItem({ icon, text, url }) {
    const { expanded } = useContext(SidebarContext);
    const { url: currentUrl } = usePage(); // ✅ Inertia's current route

    const isActive = currentUrl.startsWith(url);

    return (
        <li>
            <Link
                href={url}
                className={`group relative flex items-center font-medium rounded-md cursor-pointer transition-all
          ${expanded ? "px-3 py-2" : "py-3 justify-center"}
          ${
                    isActive
                        ? "bg-green-100 text-primary"
                        : "text-gray-600 hover:bg-green-100"
                }
        `}
            >
                {/* Icon */}
                <span className="transition-transform duration-200 group-hover:scale-110">
          {React.cloneElement(icon, { size: 22 })}
        </span>

                {/* Text only when expanded */}
                {expanded && (
                    <span className="ml-3 whitespace-nowrap transition-all duration-300">
            {text}
          </span>
                )}

                {/* Tooltip when collapsed */}
                {!expanded && (
                    <span className="absolute left-full ml-3 rounded-md bg-emerald-500 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all whitespace-nowrap">
            {text}
          </span>
                )}
            </Link>
        </li>
    );
}
