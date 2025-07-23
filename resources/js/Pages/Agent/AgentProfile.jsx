import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from '@/Components/NavBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import FeedbackTab from '@/Components/FeedbackTab'
import {
    faEnvelope,
    faMapMarkerAlt,
    faPhoneAlt,
    faUser,
} from '@fortawesome/free-solid-svg-icons'
import {Link} from "@inertiajs/react";

const tabs = [
    { name: 'Listing', key: 'listing', icon: HomeIcon },
    { name: 'Feedback', key: 'feedback', icon: ChatBubbleLeftRightIcon },

]

export default function AgentProfile({ agent }) {
    const [currentTab, setCurrentTab] = useState('listing')
    const [underlineStyle, setUnderlineStyle] = useState({})
    const tabRefs = useRef({})

    console.log(agent)

    useEffect(() => {
        const el = tabRefs.current[currentTab]
        if (el) {
            const { offsetLeft: left, offsetWidth: width } = el
            setUnderlineStyle({ left, width })
        }
    }, [currentTab])

    const renderContent = () => {
        switch (currentTab) {
            case 'listing':
                return (
                    <motion.div
                        key="profile"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4 w-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {agent.listing.map((property) => {
                            const data = property.property
                            const status = property.status?.toLowerCase() || 'unknown'
                            return (
                                <motion.div
                                    key={property.id}
                                    className="w-full border rounded-xl bg-white shadow-sm overflow-hidden"
                                    whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <div className="relative">
                                        <img
                                            src={data?.image_url ? `/storage/${data.image_url}` : '/placeholder.jpg'}
                                            alt={data?.title || 'Property image'}
                                            className="h-40 w-full object-cover"
                                        />
                                        <span
                                            className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                                                status === 'sold'
                                                    ? 'bg-red-100 text-red-600'
                                                    : status === 'available'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                            {data?.title || 'Untitled Property'}
                                        </h3>
                                        {data?.address && (
                                            <p className="text-sm text-gray-500 truncate mb-1">{data.address}</p>
                                        )}
                                        {data?.price && (
                                            <p className="text-sm text-gray-800 font-medium">
                                                Price:{' '}
                                                <span className="text-indigo-600">
                                                  ₱{Number(data.price).toLocaleString('en-PH')}
                                                </span>
                                            </p>
                                        )}
                                        <button className="mt-4 w-full py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                                            View Details
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )
            case 'feedback':
                return (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <FeedbackTab feedbacks={agent.feedback_as_receiver} />
                    </motion.div>
                )


            default:
                return null
        }
    }

    return (
        <>
            <div className="max-w-7xl mt-24 mx-auto rounded-xl overflow-hidden shadow-lg bg-white">
                <NavBar />

                <div className="absolute top-20 left-6 z-20">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                        aria-label="Back to Home"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                </div>


                {/* Header */}
                <div className="bg-teal-700 h-40 relative">
                    <div className="absolute bottom-[-2.5rem] left-6">
                        <div className="w-20 h-20 rounded-full bg-gray-900 border-4 border-white text-white flex items-center justify-center text-xl font-bold shadow-lg">
                            {agent.name.charAt(0)}
                        </div>
                    </div>
                </div>

                {/* Name and Role */}
                <div className="pl-28 pt-4 pb-2">
                    <h1 className="text-xl font-semibold text-gray-900">{agent.name}</h1>
                    <p className="text-sm text-gray-500">MJVI Agent</p>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-100 mt-4 relative">
                    <div className="flex justify-end pr-6">
                        <div className="relative w-fit">
                            <nav className="flex space-x-6 relative">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        ref={(el) => (tabRefs.current[tab.key] = el)}
                                        onClick={() => setCurrentTab(tab.key)}
                                        className={`flex flex-col items-center px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                                            currentTab === tab.key
                                                ? 'text-indigo-600'
                                                : 'text-gray-500 hover:text-black'
                                        }`}
                                        aria-current={currentTab === tab.key ? 'page' : undefined}
                                    >
                                        <tab.icon
                                            className={`h-5 w-5 mb-1 transition-transform duration-300 ${
                                                currentTab === tab.key
                                                    ? 'scale-110 text-indigo-600'
                                                    : 'text-gray-400'
                                            }`}
                                        />
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                            <motion.span
                                className="absolute bottom-0 h-0.5 bg-indigo-600"
                                animate={{
                                    left: underlineStyle.left,
                                    width: underlineStyle.width,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-col max-w-7xl mx-auto md:flex-row gap-6 mt-8 px-4 sm:px-6 lg:px-8">
                <div className="md:w-1/3 flex flex-col gap-y-6 w-full">
                    <div className="border rounded-2xl p-6 flex items-center justify-center gap-4 shadow-sm">
                        <p className="flex flex-col justify-center items-center">
                            <span className="text-2xl font-semibold">{agent.listing.length}</span>
                            <span className="text-gray-600">Total Listings</span>
                        </p>
                        <div className="border-r h-12"></div>
                        <p className="flex flex-col justify-center items-center">
                          <span className="text-2xl font-semibold">
                            {agent.listing.filter(l => l.status?.toLowerCase() === 'sold').length}
                          </span>
                            <span className="text-gray-600">Sold Listings</span>
                        </p>
                    </div>
                    <div className="border rounded-2xl p-6 flex flex-col gap-4 bg-white shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">About</h2>
                        {[
                            { icon: faUser, value: agent.bio, fallback: 'N/A' },
                            { icon: faMapMarkerAlt, value: agent.address, fallback: 'Address not available' },
                            { icon: faPhoneAlt, value: agent.contact_number, fallback: 'No contact number' },
                            { icon: faEnvelope, value: agent.email, fallback: 'Email not provided' }
                        ].map((info, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <FontAwesomeIcon icon={info.icon} className="text-gray-500" />
                                <p className="text-gray-700 font-medium break-words">
                                    {info.value || info.fallback}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:w-2/3 w-full bg-gray-100 rounded-2xl p-6 max-h-[75vh] overflow-y-auto custom-scroll">
                    <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
                </div>
            </div>
        </>
    )
}
