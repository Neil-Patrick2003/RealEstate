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
            <WhyChooseUs />
            <OurProcess />
            <CTA/>
            <OurBroker />






            <Footer />
        </div>
    );
};

export default Welcome;
