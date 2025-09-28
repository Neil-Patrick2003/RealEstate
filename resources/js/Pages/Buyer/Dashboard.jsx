import BuyerLayout from "@/Layouts/BuyerLayout.jsx";
import {usePage, Link, Head, router} from "@inertiajs/react";
import PropertiesMap from "@/Components/PropertiesMap.jsx";
import dayjs from "dayjs";
import React, {useState} from "react";
import Progress from "@/Components/Progress.jsx";
import PropertyCard from "@/Components/Property/PropertyCard.jsx";
import CustomCarousel from "@/Components/Slider/custom.slider.jsx";
import ProfileProgress from "@/Components/ProfileProgress.jsx";
import logo from '../../../assets/real estate.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCheckCircle, faUserTie } from "@fortawesome/free-solid-svg-icons";

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
    const [favoriteIds, setFavoriteIds] = useState([]);


    const toggleFavorite = (propertyId) => {
        setFavoriteIds((prev) =>
            prev.includes(propertyId)
                ? prev.filter((id) => id !== propertyId)
                : [...prev, propertyId]
        );

        router.post(
            `/properties/${propertyId}/favorites`,
            { id: propertyId },
            {
                preserveScroll: true,
                onSuccess: () => console.log("Added to favorites!"),
                onError: () => console.log("Failed to add to favorites"),
            }
        );
    };

    return (
        <BuyerLayout>
            <Head title="Dashboard" />
            <div className="py-10 px-4 sm:px-4 lg:px-0 space-y-12">

                {/* Welcome + Carousel Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="md:col-span-2 bg-gradient-to-tl from-primary to-accent rounded-2xl p-4 md:p-6 lg:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1 md:space-y-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Welcome back 👋</h1>
                            <p className="text-xl font-medium">{auth?.name}</p>
                            <p className="text-sm text-slate-200">
                                Explore a personalized experience to help you find the perfect lot.
                                Track saved properties and manage your inquiries — all in one place.
                            </p>
                            <Link href="/" className="inline-block px-4 py-2 bg-secondary text-white rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                                Discover Now
                            </Link>
                        </div>
                        <img src={logo} alt="Lot Finder" className="w-80 h-64 hidden md:block" />
                    </div>

                    {/* Carousel */}


                    <div className="relative z-10">
                              <div className="relative rounded-2xl overflow-hidden shadow-xl">

                            {/* Foreground: Carousel content */}
                                  <div className="relative z-10">
                                      <CustomCarousel>
                                          {/* Slide 1 - Find Your Dream Home */}
                                          <div className="relative rounded-xl h-60 sm:h-72 md:h-80 flex flex-col justify-center items-center text-center p-3 sm:p-4 lg:p-6 text-white overflow-hidden bg-gradient-to-tl from-primary to-accent">
                                              <FontAwesomeIcon
                                                  icon={faHouse}
                                                  className="absolute text-white opacity-20 text-6xl sm:text-7xl md:text-[8rem] top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none"
                                              />
                                              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 z-10">
                                                  Find Your Dream Home
                                              </h2>
                                              <p className="text-sm sm:text-base md:text-lg z-10 max-w-xs sm:max-w-md">
                                                  Browse hundreds of properties across the country.
                                              </p>
                                          </div>

                                          {/* Slide 2 */}
                                          <div className="relative rounded-xl h-60 sm:h-72 md:h-80 flex flex-col justify-center items-center text-center p-3 sm:p-4 lg:p-6 text-white overflow-hidden bg-gradient-to-tl from-primary to-accent">
                                              <FontAwesomeIcon
                                                  icon={faCheckCircle}
                                                  className="absolute text-white opacity-20 text-6xl sm:text-7xl md:text-[8rem] top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none"
                                              />
                                              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 z-10">
                                                  Verified Listings Only
                                              </h2>
                                              <p className="text-sm sm:text-base md:text-lg z-10 max-w-xs sm:max-w-md">
                                                  We make sure every property is checked and trusted.
                                              </p>
                                          </div>

                                          {/* Slide 3 */}
                                          <div className="relative rounded-xl h-60 sm:h-72 md:h-80 flex flex-col justify-center items-center text-center p-3 sm:p-4 lg:p-6 text-white overflow-hidden bg-gradient-to-tl from-primary to-accent">
                                              <FontAwesomeIcon
                                                  icon={faUserTie}
                                                  className="absolute text-white opacity-20 text-6xl sm:text-7xl md:text-[8rem] top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none"
                                              />
                                              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 z-10">
                                                  Connect With Local Agents
                                              </h2>
                                              <p className="text-sm sm:text-base md:text-lg z-10 max-w-xs sm:max-w-md">
                                                  Get expert advice directly from certified professionals.
                                              </p>
                                          </div>
                                      </CustomCarousel>
                                  </div>
                              </div>
                    </div>

                </section>

                {/* Featured Properties */}
                <section className="space-y-4 mb-10 ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">Featured Properties</h2>
                        <Link href="/buyer/properties" className="text-sm text-primary hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto flex space-x-6 snap-x snap-mandatory scroll-smooth pb-2">
                        {properties.slice(0, 4).map((property) => (
                            <div key={property.id} className="snap-center flex-shrink-0 w-80">
                                <PropertyCard property={property} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />
                            </div>
                        ))}
                    </div>

                </section>

                {/* Map View */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Explore on Map</h2>
                    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <PropertiesMap properties={properties} />
                    </div>
                </section>

                {/* Inquiries Section */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Recent Inquiries Table */}
                        <div className="col-span-1 md:col-span-2 border rounded-2xl bg-white shadow-sm">
                            <div className="flex items-center justify-between px-6 pt-4">
                                <h2 className="text-xl font-semibold text-gray-800">Recent Inquiries</h2>
                                <Link href="/buyer/inquiries" className="text-sm text-primary hover:underline">View All</Link>
                            </div>
                            <div className="overflow-x-auto mt-2 rounded-b-lg">
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
                                    {inquiries.length > 0 ? (
                                        inquiries.map((inquiry) => {
                                            const statusClass = statusStyles[inquiry.status] || statusStyles.default;
                                            return (
                                                <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors duration-200 flex flex-col md:table-row w-full">
                                                    <td className="p-3 text-center hidden md:table-cell">
                                                        <input type="checkbox" className="rounded border-gray-400" />
                                                    </td>
                                                    <td className="p-3 md:table-cell">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={`/storage/${inquiry.property?.image_url}`}
                                                                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                                                alt={inquiry.property?.title || 'Property'}
                                                                className="w-14 h-14 object-cover rounded-md"
                                                            />
                                                            <div className="truncate">
                                                                <p className="font-semibold text-gray-800 truncate w-48 md:w-auto">{inquiry.property?.title ?? 'Unknown Property'}</p>
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {inquiry.property?.property_type} | {inquiry.property?.sub_type}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 md:table-cell">
                                                        <p className="text-primary hover:underline cursor-pointer">
                                                            {inquiry.agent?.name ?? inquiry.broker?.name}
                                                            <br />
                                                            <span className="text-xs text-gray-500">{inquiry.agent?.email}</span>
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
                                            <td colSpan="5" className="text-center py-6 text-gray-400">
                                                No inquiries found.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Inquiry Progress Card */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">In Progress Inquiry</h2>
                            <div className="border border-gray-100 p-4 rounded-xl shadow-md bg-white transition hover:shadow-lg">
                                {progressInquiry ? (
                                    <>
                                        <img
                                            src={`/storage/${progressInquiry.property.image_url}`}
                                            alt={progressInquiry.property.title}
                                            onError={(e) => e.currentTarget.src = '/placeholder.png'}
                                            className="rounded-xl h-48 w-full object-cover mb-2"
                                        />
                                        <p className="text-lg font-semibold mb-2">{progressInquiry.property.title}</p>
                                        <Progress inquiryStatus={progressInquiry.status} />
                                    </>
                                ) : (
                                    <ProfileProgress user={auth} />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </BuyerLayout>
    );
}
