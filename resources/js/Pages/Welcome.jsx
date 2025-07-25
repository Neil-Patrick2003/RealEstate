import React, { useCallback, useEffect, useState } from 'react';
import Hero from './LandingPage/Hero';
import NavBar from '@/Components/NavBar';
import PropertyList from './LandingPage/PropertyList';
import Footer from './LandingPage/Footer';
import backgroundImage from "../../assets/background.jpg";
import { router } from "@inertiajs/react";
import { debounce } from "lodash";
import ToastHandler from "@/Components/ToastHandler.jsx";

const Welcome = ({ auth, properties, search = '', initialType = "All" }) => {
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
        debounce((value) => {
            fetchProperties(value, selectedType);
        }, 500),
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

    return (
        <div className="relative overflow-x-hidden bg-gray-100">
            <ToastHandler />

            {/* Hero Section */}
            <div
                className="relative h-[65vh] bg-cover bg-center bg-no-repeat"
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

            {/* Filters and PropertyList */}
            <div className="relative mt-12 rounded-t-3xl shadow-lg px-8 py-6 bg-gray-100">
                <PropertyList properties={properties} />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Welcome;
