import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/inertia-react';
import dayjs from "dayjs";
import ProfileProgress from "@/Components/ProfileProgress.jsx";

export default function Dashboard({ total_properties, total_inquiries, total_views, sold_properties, recent_properties, recent_inquiries, auth_user }) {
    const { t } = useTranslation();
    const auth = usePage().props?.auth?.user ?? null;

    const cards = [
        {
            label: total_properties === 0 ? 'No Listings' : 'Total Listings',
            count: total_properties,
            icon: total_properties === 0 ? '❌' : '🏘️',
            from: 'from-green-200',
            to: 'to-green-100',
            text: 'text-green-900',
        },
        {
            label: sold_properties === 0 ? 'No Published Listings' : 'Published',
            count: sold_properties,
            icon: sold_properties === 0 ? '🚫' : '📢',
            from: 'from-purple-200',
            to: 'to-purple-100',
            text: 'text-purple-900',
        },
        {
            label: 'Total Inquiries',
            count: total_inquiries,
            icon: total_inquiries === 0 ? '📭' : '⏳',
            from: 'from-yellow-200',
            to: 'to-yellow-100',
            text: 'text-yellow-900',
        },
        {
            label: total_views === 0 ? 'No Trippings' : 'Incoming Trippings',
            count: total_views,
            icon: total_views === 0 ? '👁️‍🗨️' : '📅',
            from: 'from-orange-200',
            to: 'to-orange-100',
            text: 'text-orange-900',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const statusColors = {
        Accepted: 'bg-green-100 text-green-800 ring-green-300',
        Cancelled: 'bg-red-100 text-red-800 ring-red-300',
        Pending: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
        default: 'bg-gray-100 text-gray-700 ring-gray-300',
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const hoverScale = {
        whileHover: { scale: 1.05 },
        transition: { type: 'spring', stiffness: 300 },
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        variants={cardVariants}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className={`relative overflow-hidden flex flex-col gap-4 p-6 rounded-xl shadow-md bg-gradient-to-tl ${card.from} ${card.to} cursor-pointer`}
                    >
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-2xl shadow">
                            {card.icon}
                        </div>

                        <div className="mt-2">
                            <p className={`text-sm font-medium ${card.text}`}>{card.label}</p>
                            <p className={`text-3xl font-bold ${card.text}`}>{card.count}</p>
                        </div>

                        <div className="absolute right-2 bottom-2 text-6xl opacity-10 pointer-events-none select-none">
                            {card.icon}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Properties */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-10 px-4"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Recent Properties</h2>

                    <motion.div {...hoverScale}>
                        <Link
                            href="/properties/create"
                            className="text-sm bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-600 transition duration-200"
                        >
                            + Add Property
                        </Link>
                    </motion.div>

                </div>

                {recent_properties.length === 0 ? (
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center justify-center h-40 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300"
                    >
                        <p>No recent properties. Start by adding one!</p>
                    </motion.div>

                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recent_properties.slice(0, 5).map((property) => (
                            <motion.div
                                key={property.id}
                                whileHover={{ scale: 1.04 }}
                                className="rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 overflow-hidden flex flex-col"
                            >
                                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                                    <img
                                        src={`/storage/${property.image_url}`}
                                        alt={property.title}
                                        className="object-cover opacity-90 w-full h-full transform transition-transform duration-500 hover:scale-105"
                                    />
                                    <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                                        {property.sub_type}
                                    </span>
                                    <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-md shadow
                                        ${property.status === 'Unassigned' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                        {property.status}
                                    </span>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-gray-900 truncate max-w-[70%]" title={property.title}>
                                            {property.title}
                                        </h3>
                                        <p className="text-primary font-bold text-xl whitespace-nowrap">
                                            ₱{Number(property.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-5">
                                        <div className="flex flex-col max-w-[75%]">
                                            <p className="text-gray-600 text-sm truncate" title={property.address}>
                                                {property.address}
                                            </p>
                                            <p className="text-gray-400 text-xs italic mt-1">
                                                Posted on {new Date(property.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/properties/${property.id}`}
                                            className="text-primary font-semibold hover:text-accent transition-colors duration-200 whitespace-nowrap"
                                        >
                                            View Details &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Recent Inquiries */}
            <section className="mt-12 px-4">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Recent Inquiries</h2>

                {recent_inquiries.length === 0 ? (

                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center justify-center h-40 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300"
                    >
                        <p>No recent inquiries yet.</p>
                    </motion.div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                        <table className="min-w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Property</th>
                                <th className="p-4">Agent</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date Inquired</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-dashed">
                            {recent_inquiries.map((inquiry) => {
                                const statusClass = statusColors[inquiry.status] || statusColors.default;
                                return (
                                    <tr key={inquiry.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`/storage/${inquiry.property?.image_url}`}
                                                    alt={inquiry.property?.title || 'Property'}
                                                    className="w-14 h-14 object-cover rounded-md"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800 truncate max-w-[200px]">{inquiry.property?.title ?? 'Unknown Property'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {inquiry.property?.property_type} | {inquiry.property?.sub_type}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-primary font-medium">{inquiry.agent?.name ?? 'Unknown Agent'}</p>
                                            <p className="text-xs text-gray-500">{inquiry.agent?.email}</p>
                                        </td>
                                        <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${statusClass}`}>
                                                    {inquiry.status}
                                                </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {dayjs(inquiry.created_at).format('MMMM D, YYYY')}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Support + Profile Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-4">
                <div className="col-span-1 md:col-span-2">
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-md p-6 h-full flex flex-col justify-between transition-all hover:shadow-lg">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">💬 Contact Support</h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Need assistance with managing properties, inquiries, or your account? Our support team is ready to help you.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full text-xl">📧</div>
                                    <a href="mailto:support@realestate.com" className="text-sm text-gray-800 hover:text-indigo-600 font-medium">
                                        support@realestate.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 text-green-600 p-2 rounded-full text-xl">📞</div>
                                    <p className="text-sm text-gray-800 font-medium">+63 912 345 6789</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full text-xl">💻</div>
                                    <a href="#" className="text-sm text-gray-800 hover:text-blue-600 font-medium">
                                        Live Chat (Coming Soon)
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <a
                                href="mailto:support@realestate.com"
                                className="inline-block w-full text-center bg-primary text-white text-sm font-semibold px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition duration-200"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>

                <div className="col-span-1">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 h-full transition-all hover:shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">👤 Profile Progress</h2>
                        <ProfileProgress user={auth_user} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
