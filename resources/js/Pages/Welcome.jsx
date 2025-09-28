import React, {useCallback, useEffect, useRef, useState} from 'react';
import { router, Link } from '@inertiajs/react';
import { debounce } from 'lodash';
import {color, motion} from 'framer-motion';
import {
    DoorClosed,
    Scaling,

    Bath,
    Bed,
    CircleParking,
    MapPinIcon,
    ArrowRightIcon,
} from 'lucide-react';

import NavBar from '@/Components/NavBar';
import ToastHandler from '@/Components/ToastHandler.jsx';
import Hero from './LandingPage/Hero';
import PropertyList from './LandingPage/PropertyList';
import Footer from './LandingPage/Footer';

import backgroundImage from '../../assets/background.jpg';
import process from "../../assets/process.png";
import {Card, CardContent} from "@mui/material";
import Button from "@mui/material/Button";
import Featured from "@/Components/Featured.jsx";
import MostViewed from "@/Components/MostViewed.jsx";
import WhyChooseUs from "@/Components/WhyChooseUs.jsx";
import OurBroker from "@/Components/OurBroker.jsx";
import OurProcess from "@/Components/OurProcess.jsx";
import CTA from "@/Components/CTA.jsx";

const Welcome = ({ auth, properties, search = '', initialType = 'All', featured,  }) => {
    const [searchTerm, setSearchTerm] = useState(search || '');
    const [selectedType, setSelectedType] = useState(initialType);

    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    const fetchProperties = (searchValue = searchTerm, typeValue = selectedType) => {
        router.get(
            '/',
            { search: searchValue, type: typeValue },
            { preserveState: true, replace: true }
        );
    };

    const debouncedSearch = useCallback(
        debounce((value) => fetchProperties(value, selectedType), 500),
        [selectedType]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        fetchProperties(searchTerm, type);
    };

    const sliderRef = useRef(null)

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
        }
    };
    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
    };




    return (
        <div className="relative overflow-x-hidden bg-white">
            <ToastHandler />

            {/* Hero Section */}
            <div
                className="relative h-[100vh] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="relative z-10">
                    <NavBar />
                    <Hero
                        searchTerm={searchTerm}
                        handleSearchTermChange={handleSearchTermChange}
                        selectedType={selectedType}
                        handleTypeChange={handleTypeChange}
                        setSelectedType={setSelectedType}
                    />
                </div>
            </div>
            <MostViewed  featured={featured}/>
            <section className="max-w-7xl mx-auto p-4 md:px-0 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <h1 className="text-2xl md:text-4xl font-semibold leading-snug tracking-tight text-gray-900 dark:text-white">
                            Creating seamless property solutions for a smarter, & more transparent real estate journey
                        </h1>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            Whether you're searching for your dream home, listing a property for sale,
                            or exploring investment opportunities, <span className="font-semibold text-primary">Aelo</span>
                            provides expert guidance every step of the way. With a wide network of properties,
                            from cozy apartments to luxury estates, and a team of experienced professionals,
                            we tailor our services to meet your unique needs.
                        </p>
                        <Link href={`/all-properties`}>
                            <span className="relative inline-block px-6 py-2 mt-4 text-sm font-medium text-white bg-primary rounded-full overflow-hidden transition-colors duration-300 hover:text-white group">
                                <span className="absolute inset-0 w-full h-full bg-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out z-0"></span>
                                <span className="relative z-10">About Us</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right Content */}
                    <div className="space-y-6">
                        <img
                            className="rounded-2xl shadow-lg w-full h-72 object-cover"
                            src="https://cdn.prod.website-files.com/6737264eed7bd3501f835ab4/676a943aa5211faf7c509f0b_about-us.jpg"
                            alt="About Us"
                        />
                        <div className="bg-green-100 rounded-2xl p-6 shadow-sm">
                            <span className="text-3xl md:text-4xl font-bold text-green-700">5,000+</span>
                            <p className="mt-2 text-gray-700">
                                With over <span className="font-semibold">5,000 properties sold</span>, MJVI Realty
                                continues to deliver trusted solutions to clients worldwide.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <WhyChooseUs />
            <OurProcess />
            <CTA/>
            <OurBroker />






            <Footer />
        </div>
    );
};

export default Welcome;
