import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import Sidebar, { SidebarItem } from "@/Components/Navbar/Navbar";
import {
    Menu, X, Home, UserRoundCog, ArrowRightLeft, HandCoins, Banknote, ShieldCheck,
    BarChart3, Settings, Bell
} from "lucide-react";
import ToastHandler from "@/Components/ToastHandler.jsx";

export default function AdminLayout({ children, header }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { url } = usePage();

    // Single source of truth for navigation
    const NAV_ITEMS = [
        { label: "Home", icon: <Home />, href: "/admin/dashboard" },
        { label: "Account Management", icon: <UserRoundCog />, href: "/admin/users" },
        { label: "Transaction Management", icon: <ArrowRightLeft />, href: "/admin/transactions" },
        { label: "Payments & Settlements", icon: <HandCoins />, href: "/admin/payments" },
        { label: "Loan & Credit Management", icon: <Banknote />, href: "/admin/loans" },
        { label: "Security & Compliance", icon: <ShieldCheck />, href: "/admin/security" },
        { label: "Reports & Analytics", icon: <BarChart3 />, href: "/admin/reports" },
        { label: "System Administration", icon: <Settings />, href: "/admin/system" },
    ];

    const isActive = (href) => url?.startsWith(href);

    return (
        <>
            <Head title={header?.title ?? "Admin Dashboard"} />

            <div className="flex h-screen">
                {/* Desktop sidebar */}
                <div className="hidden md:block">
                    <Sidebar>
                        {NAV_ITEMS.map((item) => (
                            <SidebarItem
                                key={item.href}
                                icon={item.icon}
                                url={item.href}
                                text={item.label}
                                active={isActive(item.href)}
                            />
                        ))}
                    </Sidebar>
                </div>

                {/* Mobile overlay */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Mobile drawer */}
                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <h1 className="text-lg font-semibold">Menu</h1>
                        <button
                            className="p-2 rounded-md hover:bg-gray-100"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Reuse the same items so it stays in sync */}
                    <Sidebar>
                        {NAV_ITEMS.map((item) => (
                            <SidebarItem
                                key={item.href}
                                icon={item.icon}
                                url={item.href}
                                text={item.label}
                                active={isActive(item.href)}
                                onClick={() => setMobileOpen(false)}
                            />
                        ))}
                    </Sidebar>
                </div>

                {/* Main content */}
                <main className="flex flex-1 flex-col">
                    {/* Top bar */}
                    <div className="flex w-full items-center justify-between border-b px-4 py-3 md:px-6">
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 rounded-md border text-gray-600 hover:bg-gray-100"
                            onClick={() => setMobileOpen((s) => !s)}
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Search (optional) */}
                        <input
                            type="text"
                            placeholder="Search…"
                            className="hidden sm:block flex-1 mx-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />

                        {/* Actions */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <button className="p-2 rounded-md hover:bg-gray-100" aria-label="Notifications">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-md hover:bg-gray-100" aria-label="Settings">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Page body */}
                    <div className="p-4 md:p-6">
                        <ToastHandler />
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
