import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Sidebar, { SidebarItem } from "@/Components/Navbar/Navbar";
import { Menu, X, Home, Users, User, Settings, Bell, UserRoundCog, HandCoins, Handshake, ArrowRightLeft } from "lucide-react";
import ToastHandler from "@/Components/ToastHandler.jsx";


export default function AdminLayout({ children, header }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-row h-screen">
                {/* Sidebar for desktop */}
                <div className="hidden md:block">
                    <Sidebar>
                        <SidebarItem icon={<Home />}  url={'/admin/dashboard'} text="Home" />
                        <SidebarItem icon={<UserRoundCog />} url={'/admin/users'} text="Account Management"  />
                        <SidebarItem icon={<ArrowRightLeft />} text="Transaction Management"  />
                        <SidebarItem icon={<HandCoins />} text="Payments & Settlements"  />
                        <SidebarItem icon={<Handshake />} text="Loan & Credit Management"  />
                        <SidebarItem icon={<Handshake />} text="Security & Compliance"  />
                        <SidebarItem icon={<User />} text="Report & Analytics"  />
                        <SidebarItem icon={<Settings />} text="System Administration"  />
                    </Sidebar>
                </div>

                {/* Mobile sidebar overlay (click to close) */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Mobile sidebar (drawer) */}
                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden ${
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <h1 className="text-lg font-semibold">Menu</h1>
                        <button
                            className="p-2 rounded-md hover:bg-gray-100"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    haha
                    <Sidebar>
                        <SidebarItem icon={<Home />} text="Dadsdsashboard" active />
                        <SidebarItem icon={<User />} text="Customer Management"  />
                        <SidebarItem icon={<User />} text="Transaction Management"  />
                        <SidebarItem icon={<User />} text="Payment & Settlement"  />
                        <SidebarItem icon={<User />} text="Loan and Credit Managent"  />
                        <SidebarItem icon={<User />} text="Security Compplience"  />
                        <SidebarItem icon={<User />} text="Report & Analytics"  />
                        <SidebarItem icon={<Settings />} text="System Adminitrator"  />
                    </Sidebar>
                </div>

                {/* Main content */}
                <main className="flex flex-col flex-1">
                    {/* Top Navbar */}
                    <div className="flex w-full px-6 py-4 justify-between items-center border-b">
                        {/* Mobile hamburger button */}
                        <button
                            className="md:hidden p-2 rounded-md border text-gray-600 hover:bg-gray-100"
                            onClick={() => setMobileOpen((prev) => !prev)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Search bar */}
                        <input
                            type="text"
                            placeholder="Search..."
                            className="hidden sm:block flex-1 mx-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />

                        {/* Actions */}
                        <div className="flex space-x-4 text-gray-600">
                            <Bell className="cursor-pointer" />
                            <Settings className="cursor-pointer" />
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-6">
                        <ToastHandler />
                        {children}
                    </div>

                </main>
            </div>
        </>
    );
}
