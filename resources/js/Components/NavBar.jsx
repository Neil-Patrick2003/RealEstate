import {Link} from "@inertiajs/react";
import framer_logo from "../../assets/framer_logo.png";
import React from "react";

export default function NavBar(){
    return (
        <header className="sticky top-0 z-40 supports-[backdrop-filter]:bg-white/70 bg-white shadow/[0_1px_0_#e5e7eb] backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img src={framer_logo} alt="logo" className="w-8 h-8 -ml-1.5 drop-shadow-md" />
                    <span className="font-extrabold tracking-tight text-gray-900">MJVI<span className="text-emerald-600">Realty</span></span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                    <a href="#features" className="hover:text-gray-900">Features</a>
                    <a href="#explore" className="hover:text-gray-900">Explore</a>
                    <a href="#how" className="hover:text-gray-900">How it works</a>
                    <a href="#faq" className="hover:text-gray-900">FAQ</a>
                </nav>
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Sign in</Link>
                    <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700">Get Started</Link>
                </div>
                <button className="md:hidden p-2 rounded-lg ring-1 ring-gray-200">☰</button>
            </div>
        </header>
    );
}
