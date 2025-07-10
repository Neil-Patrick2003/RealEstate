import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import { usePage, Link } from "@inertiajs/react";
import PropertiesMap from "@/Components/PropertiesMap.jsx";
import dayjs from "dayjs";
import React from "react";
import Progress from "@/Components/Progress.jsx";


const statusStyles = {
    accepted: 'bg-green-100 text-green-700 ring-green-200',
    rejected: 'bg-red-100 text-red-700 ring-red-200',
    pending: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
    cancelled: 'bg-gray-100 text-gray-700 ring-gray-200',
    default: 'bg-orange-100 text-orange-700 ring-orange-200'
};

export default function Dashboard({ properties, inquiries }) {
    const auth = usePage().props?.auth?.user ?? null;
    const progressInquiry = inquiries.find(i => i.status === 'accepted');
    return (
        <BuyerLayout>
            <div className="py-10 px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Welcome & Quick Actions */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="md:col-span-2 bg-gradient-to-tl from-primary to-accent rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
                            <p className="text-xl font-medium">{auth?.name}</p>
                            <p className="text-sm leading-relaxed text-slate-200">
                                Explore a personalized experience to help you find the perfect lot.
                                Track saved properties and manage your inquiries — all in one place.
                            </p>
                            <Link
                                href="/"
                                className="inline-block px-4 py-2 bg-secondary text-white rounded-md text-sm font-semibold hover:scale-105 transition-transform"
                            >
                                Discover Now
                            </Link>
                        </div>
                        <img
                            src="/images/lot-finder-icon.svg"
                            alt="Lot Finder"
                            className="w-24 h-24 opacity-90 hidden md:block"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-tl from-primary to-accent rounded-2xl p-6 text-white">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <ul className="space-y-3 text-sm">
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
                </section>

                {/* Profile Completion Progress */}
                <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase">Profile Progress</h3>
                    <div className="mt-4">
                        <div className="overflow-hidden rounded-full bg-gray-200 h-2">
                            <div
                                className="h-2 bg-gradient-to-r from-lightaccent to-accent rounded-full"
                                style={{ width: "37.5%" }}
                            />
                        </div>
                        <div className="mt-6 hidden sm:grid grid-cols-4 text-sm font-medium text-gray-600">
                            <div className="text-accent">Personal Info</div>
                            <div className="text-center text-accent">Contacts</div>
                            <div className="text-center">Email</div>
                            <div className="text-right">Verified</div>
                        </div>
                    </div>
                </section>

                {/* Featured Properties Carousel */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Featured Properties</h2>
                    <div className="overflow-x-auto flex space-x-6 snap-x snap-mandatory scroll-smooth pb-2">
                        {properties.slice(0, 5).map((property) => (
                            <div
                                key={property.id}
                                className="min-w-[75%] sm:min-w-[300px] md:min-w-[350px] max-w-sm bg-white rounded-xl shadow-md snap-start transition hover:shadow-lg hover:scale-[1.02] duration-300 relative"
                            >
                                {/* Property Image */}
                                <div className="relative">
                                    <img
                                        src={`/storage/${property.image_url}`}
                                        alt={property.title}
                                        className="w-full h-48 object-cover rounded-t-xl"
                                    />
                                    {/* Bite Effect Button */}
                                    <div className="absolute -bottom-4 right-4 z-10">
                                        <button className="bg-secondary text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Property Info */}
                                <div className="p-4 pt-6 space-y-1">
                                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                        {property.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">3 Bed · 2 Bath · 1,800 sqft</p>
                                    <p className="text-xl font-bold text-green-600 mt-1">$321,900</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Map Section */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Explore on Map</h2>
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <PropertiesMap properties={properties} />
                    </div>
                </section>

                {/*recent inquiry*/}
                <section>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='col-span-1 md:col-span-2'>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Explore on Map</h2>

                            <div className="overflow-x-auto bg-white shadow-sm rounded-b-lg">
                                <table className="min-w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide hidden md:table-header-group">
                                    <tr>
                                        <th className="p-3 text-center"><input type="checkbox" className="rounded border-gray-400" /></th>
                                        <th className="p-3">Property</th>
                                        <th className="p-3">Agent</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Date Inquired</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dashed">
                                    {inquiries?.length > 0 ? (
                                        inquiries.map((inquiry) => {
                                            const statusClass = statusStyles[inquiry.status] || statusStyles.default;
                                            const isPending = inquiry.status.toLowerCase() === 'pending';
                                            const isCancelled = inquiry.status.toLowerCase() === 'cancelled';

                                            return (
                                                <tr key={inquiry.id} className="hover:bg-gray-50 flex flex-col md:table-row w-full">
                                                    <td className="p-3 text-center hidden md:table-cell">
                                                        <input type="checkbox" className="rounded border-gray-400" />
                                                    </td>
                                                    <td className="p-3 md:table-cell">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={`/storage/${inquiry.property.image_url}`}
                                                                onError={(e) => e.target.src = '/placeholder.png'}
                                                                alt={inquiry.property.title}
                                                                className="w-14 h-14 object-cover rounded-md"
                                                            />
                                                            <div className="flex flex-col">
                                                                <p className="font-semibold text-gray-800">{inquiry.property.title}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {inquiry.property.property_type} | {inquiry.property.sub_type}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 whitespace-nowrap md:table-cell">
                                                        <p className="flex flex-col cursor-pointer hover:underline text-primary">
                                                            {inquiry?.agent?.name ?? inquiry?.agent?.name ?? 'Unknown User'}
                                                            <span>{inquiry?.agent?.email ?? inquiry?.agent?.email ?? 'Unknown'}</span>
                                                        </p>
                                                    </td>

                                                    <td className="p-3 md:table-cell">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs ring-1 ${statusClass}`}>
                                                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 md:table-cell">
                                                        {dayjs(inquiry.created_at).format('MMMM D, YYYY')}
                                                    </td>


                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-6 text-gray-400">
                                                No inquiries found.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">In Progress Inquiry</h2>
                            <div className='border border-gray-100 p-4'>
                                <img src={`/storage/${progressInquiry.property.image_url}`} alt={progressInquiry.property.title} className='rounded-xl h-48 w-full object-cover'/>
                                <p>{progressInquiry.property.title}</p>
                                <Progress inquiryStatus={progressInquiry.status} />

                            </div>
                        </div>
                    </div>


                </section>
            </div>
        </BuyerLayout>
    );
}
