import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, Link, usePage} from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React from "react";


export default function Dashboard() {
      const { t } = useTranslation();
    const auth = usePage().props?.auth?.user ?? null;


    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-tl from-primary to-accent rounded-2xl px-8 py-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
                        <p className="text-xl font-medium">{auth?.name}</p>
                        <p className="text-sm text-slate-200">
                            Explore a personalized experience to help you find the perfect lot.
                            Track saved properties and manage your inquiries — all in one place.
                        </p>
                        <Link href="/" className="inline-block px-4 py-2 bg-secondary text-white rounded-md text-sm font-semibold hover:scale-105 transition-transform">
                            Discover Now
                        </Link>
                    </div>
                    <img src="/images/lot-finder-icon.svg" alt="Lot Finder" className="w-24 h-24 hidden md:block" />
                </div>

                <div className="bg-gradient-to-tl from-primary to-accent rounded-2xl p-6 text-white">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <ul className="space-y-3 text-sm">
                        <li><Link href="/saved" className="hover:underline hover:text-accent">📌 Saved Lots</Link></li>
                        <li><Link href="/inquiries" className="hover:underline hover:text-accent">📬 My Inquiries</Link></li>
                        <li><Link href="/profile" className="hover:underline hover:text-accent">👤 Manage Profile</Link></li>
                    </ul>
                </div>
            </section>
            <section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='flex flex-col gap-4 px-8 py-6 border border-gray-100 rounded-2xl shadow-sm'>
                    <p className='text-text font-bold'>Total Properties</p>
                    <p className='text-primary font-bold text-3xl'>3</p>
                    <p className='text-text '>last post 7 <span className='text-gray-400'>days ago.</span></p>
                </div>

                <div className='flex flex-col gap-4 px-8 py-6 border border-gray-100 rounded-2xl shadow-sm'>
                    <p className='text-text font-bold'>Total Properties</p>
                    <p className='text-primary font-bold text-3xl'>3</p>
                    <p className='text-text '>last post 7 <span className='text-gray-400'>days ago.</span></p>
                </div>

                <div className='flex flex-col gap-4 px-8 py-6 border border-gray-100 rounded-2xl shadow-sm'>
                    <p className='text-text font-bold'>Total Properties</p>
                    <p className='text-primary font-bold text-3xl'>3</p>
                    <p className='text-text '>last post 7 <span className='text-gray-400'>days ago.</span></p>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
