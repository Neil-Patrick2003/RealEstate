import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { usePage, Link } from "@inertiajs/react";
import PropertiesMap from "@/Components/PropertiesMap.jsx";

export default function Dashboard({properties}) {
    const auth = usePage().props?.auth?.user ?? null;

    return (
        <BuyerLayout>
            <div className="py-6 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="col-span-1 md:col-span-2 rounded-2xl bg-gradient-to-tl from-slate-900 via-slate-800 to-slate-700 p-8 text-white flex justify-between items-start">
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold">Welcome back 👋</h1>
                            <p className="text-lg font-medium">{auth?.name}</p>
                            <p className="text-sm font-mono text-slate-200 leading-relaxed">
                                Explore a personalized experience designed to help you find the perfect lot.
                                Browse listings, track saved properties, and manage inquiries — all in one place.
                            </p>

                            <Link
                                href="/"
                                className="inline-block mt-3 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition"
                            >
                                Discover Now
                            </Link>
                        </div>

                        {/* Optional Illustration or Icon */}
                        <div className="hidden md:block">
                            {/* Replace with actual image/icon if needed */}
                            <img src="/images/lot-finder-icon.svg" alt="Lot Finder" className="w-24 h-24 opacity-80" />
                        </div>
                    </div>

                    {/* Quick Access or Summary Card */}
                    <div className="col-span-1 rounded-2xl bg-gradient-to-tl from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                        <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/saved" className="hover:underline hover:text-accent">📌 Saved Lots</Link>
                            </li>
                            <li>
                                <Link href="/inquiries" className="hover:underline hover:text-accent">📬 My Inquiries</Link>
                            </li>
                            <li>
                                <Link href="/profile" className="hover:underline hover:text-accent">👤 Manage Profile</Link>
                            </li>
                        </ul>
                    </div>
                    <div className='col-span-1 md:col-span-3 p-8 rounded-2xl border border-gray-100  shadow-sm'>
                        <div>
                            <h4 className="sr-only">Status</h4>
                            <p className="font-bold text-sm uppercase text-gray-500">Profile</p>
                            <div aria-hidden="true" className="mt-6">
                                <div className="overflow-hidden rounded-full bg-gray-200">
                                    <div style={{ width: '37.5%' }} className="h-2 rounded-full bg-accent" />
                                </div>
                                <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
                                    <div className="text-accent">Personal Information</div>
                                    <div className="text-center text-accent">Contacts</div>
                                    <div className="text-center">Verify Email</div>
                                    <div className="text-right">Verified</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div>
                    <PropertiesMap properties={properties} />
                </div>
            </div>
        </BuyerLayout>
    );
}
