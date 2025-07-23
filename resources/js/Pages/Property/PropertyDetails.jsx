import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBuilding,
    faCircleCheck,
    faCircleXmark,
    faExpand,
    faHourglassHalf,
    faLocationDot,
    faTags,
    faTruckRampBox
} from "@fortawesome/free-solid-svg-icons";
import PropertyMap from "@/Components/PropertyMap.jsx";
import {Link, router} from '@inertiajs/react';
import Modal from '@/Components/Modal.jsx';
import ToastHandler from "@/Components/ToastHandler.jsx";
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import DealFormModal from "@/Components/Deals/DealFormModal.jsx";
import NavBar from "@/Components/NavBar.jsx";
import ImageModal from "@/Components/modal/ImageModal.jsx";

export default function PropertyDetail({ property }) {
    const [visibleImages, setVisibleImages] = useState([]);
    const [openImage, setOpenImage] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const isDesktop = window.innerWidth >= 768;
            setVisibleImages(isDesktop ? property.images.slice(0, 2) : property.images);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [property.images]);

    return (
        <div className='mt-20'>
            <NavBar/>


            <div className="container flex flex-col gap-6 mx-auto px-4 pb-12 md:px-8 max-w-7xl">
                <div className='flex-center-between'>
                    <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#5C7934] transition-colors duration-200">
                        <ChevronLeft/>
                        Back to Listings
                    </Link>
                </div>
                {/*images*/}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fa  de-in delay-100">
                    <div className="md:col-span-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg image-container relative">
                        <img src={`/storage/${property.image_url}`} alt="Modern two-story house with large windows, green lawn, and wooden accents in a suburban neighborhood" className="w-full h-full object-cover"/>
                        <div className="image-overlay">
                            <h3 className="text-xl font-semibold">Premium Sustainable Living</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                        {visibleImages.map((image, index) => {
                            const isLast = index === visibleImages.length - 1;
                            const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
                            const moreCount = property.images.length - visibleImages.length;

                            return (
                                <div key={image.id} className="h-[190px] md:h-[242px] rounded-2xl overflow-hidden shadow-md image-container relative"
                                     onClick={() => isLast && isDesktop && property.images.length > 2 && setOpenImage(true)}
                                >
                                    <img src={`/storage/${image.image_url}`} alt="Spacious living room with modern furniture, large windows, and wooden floors in the featured property" className="w-full h-full object-cover"/>
                                    <div className="image-overlay">
                                        <h3 className="text-lg font-medium">Elegant Living Space</h3>
                                    </div>
                                    {isLast && isDesktop && property.images.length > 2 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-semibold text-sm md:text-base backdrop-blur-sm group-hover:bg-opacity-50">
                                            +{moreCount} more
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

               {/*Property Details Section*/}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-fade-in delay-200">
                    <div className="p-6 md:p-8">

                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                            <div className="mb-4 md:mb-0">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#5C7934] mb-2">{property.title}</h1>
                                <div className="flex items-center text-[#FFA500]">
                                    <i className="fas fa-building text-lg mr-2"></i>
                                    <span className="font-medium">{property.property_type} • {property.sub_type}</span>
                                </div>
                            </div>

                            <div>
                                <div className="bg-[#5C7934]/10 px-6 py-3 rounded-lg">
                                    <p className="text-gray-600 text-sm font-medium">Price</p>
                                    <p className="text-2xl font-bold text-[#5C7934]">{Number(property.price).toLocaleString('en-PH', {
                                        style: 'currency',
                                        currency: 'PHP',
                                    })}</p>
                                </div>







                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2 md:mb-0">
                                <i className="fas fa-map-marker-alt text-[#5C7934] mr-2"></i>
                                <span className="text-gray-700">{property.addres}</span>
                            </div>
                            <div className="flex items-center">
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    <i className="fas fa-check-circle mr-1"></i> Available
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-8 p-6 bg-gray-50 rounded-xl">
                            <div className="flex flex-col items-center">
                                <i className="fas fa-ruler-combined text-2xl text-[#5C7934] mb-2"></i>
                                <span className="text-gray-600 text-sm">Area</span>
                                <span className="font-medium text-[#5C7934]">{property.property_type === 'land' ? property.lot_area : property.floor_area}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <i className="fas fa-bed text-2xl text-[#5C7934] mb-2"></i>
                                <span className="text-gray-600 text-sm">Bedrooms</span>
                                <span className="font-medium text-[#5C7934]">{property.bedrooms}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <i className="fas fa-bath text-2xl text-[#5C7934] mb-2"></i>
                                <span className="text-gray-600 text-sm">Bathrooms</span>
                                <span className="font-medium text-[#5C7934]">{property.bathrooms}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <i className="fas fa-car text-2xl text-[#5C7934] mb-2"></i>
                                <span className="text-gray-600 text-sm">Garage</span>
                                <span className="font-medium text-[#5C7934]">{property.car_slots}</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[#5C7934] mb-4 relative property-highlight">Description</h2>
                            <div
                                className="prose max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: property.description }}
                            />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[#5C7934] mb-6 relative property-highlight">Features & Amenities</h2>
                            <div className="flex flex-wrap">
                                {property.features.map((feature) => (
                                    <div className="feature-badge" key={feature.id}>
                                        <i className="fas fa-solar-panel">{feature.name}</i>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[#5C7934] mb-4 relative property-highlight">Detailed Specifications</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5C7934] uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#5C7934] uppercase tracking-wider">Details</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Year Built</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2020</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Lot Area</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">500 sqm</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Floor Area</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.property_type === 'land' ? property.lot_area : property.floor_area}</td>
                                    </tr>

                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Parking</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 Car Garage</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center bg-[#5C7934] p-6 rounded-xl mt-8">
                            <div className="text-white mb-4 md:mb-0">
                                <h3 className="text-xl font-bold mb-2">Interested in this property?</h3>
                                <p>Contact our agent today to schedule a viewing.</p>
                                <div className='flex-center gap-2 mt-6'>
                                    {property?.property_listing?.agent?.image_url ? (
                                        <img
                                            src={`/storage/${property.property_listing.agent.image_url}`}
                                            alt={property.property_listing.agent.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold uppercase">
                                            {property?.property_listing?.agent?.name
                                                ? property.property_listing.agent.name.charAt(0)
                                                : 'A'}
                                        </div>
                                    )}
                                    <p className='flex flex-col hover:underline'>{property.property_listing?.agent.name}
                                        <span className='text-sm'>{property.property_listing?.agent.email}</span>
                                    </p>

                                </div>

                            </div>
                            <button className="bg-[#FFA500] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200 flex items-center" onClick={() => setIsOpenModal(true)}>
                                <i className="fas fa-phone-alt mr-3"></i> Contact Agent
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8 animate-fade-in delay-200">
                    <div className="p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-[#5C7934] mb-4 relative property-highlight">Location</h2>
                        <div>
                            <PropertyMap coordinates={property.coordinate} />
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-[#5C7934] mb-6 relative property-highlight">Similar Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/*card 1*/}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="relative h-48">
                                <img src="https://placehold.co/600x400" alt="Contemporary home with large windows and minimalist design in a quiet neighborhood" className="w-full h-full object-cover"/>
                                    <div className="absolute top-4 right-4 bg-[#5C7934] text-white px-2 py-1 rounded-full text-xs font-medium">
                                        For Sale
                                    </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-[#5C7934] mb-1">Contemporary Valley Home</h3>
                                <p className="text-gray-600 mb-3">
                                    <i className="fas fa-map-marker-alt text-sm mr-1 text-[#FFA500]"></i>
                                    456 Modern Terrace
                                </p>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center text-gray-700">
                                        <i className="fas fa-bed mr-1 text-[#5C7934]"></i>
                                        <span className="mr-4">3</span>
                                        <i className="fas fa-bath mr-1 text-[#5C7934]"></i>
                                        <span>2</span>
                                    </div>
                                    <div className="font-bold text-[#5C7934]">₱ 7,850,000</div>
                                </div>
                                <button className="w-full bg-[#5C7934] hover:bg-[#4a6129] text-white py-2 rounded-lg transition duration-200">
                                    View Details
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="relative h-48">
                                <img src="https://placehold.co/600x400" alt="Eco-friendly timber frame house with solar panels and expansive deck" className="w-full h-full object-cover"/>
                                    <div className="absolute top-4 right-4 bg-[#5C7934] text-white px-2 py-1 rounded-full text-xs font-medium">
                                        For Sale
                                    </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-[#5C7934] mb-1">Eco Timber Home</h3>
                                <p className="text-gray-600 mb-3">
                                    <i className="fas fa-map-marker-alt text-sm mr-1 text-[#FFA500]"></i>
                                    789 Nature Way
                                </p>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center text-gray-700">
                                        <i className="fas fa-bed mr-1 text-[#5C7934]"></i>
                                        <span className="mr-4">4</span>
                                        <i className="fas fa-bath mr-1 text-[#5C7934]"></i>
                                        <span>2.5</span>
                                    </div>
                                    <div className="font-bold text-[#5C7934]">₱ 9,120,000</div>
                                </div>
                                <button className="w-full bg-[#5C7934] hover:bg-[#4a6129] text-white py-2 rounded-lg transition duration-200">
                                    View Details
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div className="relative h-48">
                                <img src="https://placehold.co/600x400" alt="Modern condo unit with floor-to-ceiling windows and city views in an urban setting" className="w-full h-full object-cover"/>
                                    <div className="absolute top-4 right-4 bg-[#5C7934] text-white px-2 py-1 rounded-full text-xs font-medium">
                                        Pre-Selling
                                    </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-[#5C7934] mb-1">Urban Skyline Condo</h3>
                                <p className="text-gray-600 mb-3">
                                    <i className="fas fa-map-marker-alt text-sm mr-1 text-[#FFA500]"></i>
                                    101 Downtown Ave
                                </p>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center text-gray-700">
                                        <i className="fas fa-bed mr-1 text-[#5C7934]"></i>
                                        <span className="mr-4">2</span>
                                        <i className="fas fa-bath mr-1 text-[#5C7934]"></i>
                                        <span>1</span>
                                    </div>
                                    <div className="font-bold text-[#5C7934]">₱ 5,950,000</div>
                                </div>
                                <button className="w-full bg-[#5C7934] hover:bg-[#4a6129] text-white py-2 rounded-lg transition duration-200">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <footer className="bg-[#5C7934] text-white py-8 mt-16">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">LuxeGreen Properties</h3>
                            <p className="text-gray-200 mb-4">Specializing in sustainable and luxury real estate since 2010.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-200 hover:text-[#FFA500] transition">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="text-gray-200 hover:text-[#FFA500] transition">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="text-gray-200 hover:text-[#FFA500] transition">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" className="text-gray-200 hover:text-[#FFA500] transition">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-200 hover:text-[#FFA500] transition">Home</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-[#FFA500] transition">Properties</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-[#FFA500] transition">Agents</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-[#FFA500] transition">About Us</a></li>
                                <li><a href="#" className="text-gray-200 hover:text-[#FFA500] transition">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Contact Info</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <i className="fas fa-map-marker-alt mr-2 text-[#FFA500]"></i>
                                    <span>123 Greenway Blvd, San Francisco</span>
                                </li>
                                <li className="flex items-center">
                                    <i className="fas fa-phone-alt mr-2 text-[#FFA500]"></i>
                                    <span>+1 (555) 123-4567</span>
                                </li>
                                <li className="flex items-center">
                                    <i className="fas fa-envelope mr-2 text-[#FFA500]"></i>
                                    <span>info@luxegreen.com</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Newsletter</h4>
                            <p className="text-gray-200 mb-4">Subscribe to get updates on new properties.</p>
                            <div className="flex">
                                <input type="email" id='email'  autoComplete='email' placeholder="Your email" className="px-4 py-2 rounded-l-lg w-full text-gray-800 focus:outline-none"/>
                                    <button className="bg-[#FFA500] hover:bg-orange-600 text-white px-4 rounded-r-lg transition">
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
                        <p>&copy; 2023 LuxeGreen Properties. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <ImageModal show={openImage} onClose={() => setOpenImage(false)}>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.map((img) => (
                        <img
                            key={img.id}
                            src={`/storage/${img.image_url}`}
                            alt={`Image ${img.id}`}
                            className="w-full h-48 object-cover rounded-lg shadow"
                        />
                    ))}
                </div>
            </ImageModal>




        </div>




    );
}
