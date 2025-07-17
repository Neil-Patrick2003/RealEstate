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

    // Sync searchTerm if props.search changes
    useEffect(() => {
        if (search) setSearchTerm(search);
    }, [search]);

    // Fetch properties with current filters
    const fetchProperties = (searchValue = searchTerm, typeValue = selectedType) => {
        router.get(
            '/',
            { search: searchValue, type: typeValue },
            { preserveState: true, replace: true }
        );
    };

    // Debounced fetch on search input change
    const debouncedSearch = useCallback(
        debounce((value) => {
            fetchProperties(value, selectedType);
        }, 500),
        [selectedType]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    // Handle search input change
    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle property type change (immediate fetch)
    const handleTypeChange = (type) => {
        setSelectedType(type);
        fetchProperties(searchTerm, type);

    };

    return (
        <div className="relative overflow-x-hidden bg-gray-100">
            <ToastHandler/>

            {/* Hero Section with fullscreen background */}
            <div
                className="relative h-screen bg-cover bg-center bg-no-repeat "
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
<<<<<<< HEAD

            {/* Filters and PropertyList - pulled up to peek */}
            <div className="relative mt-12  rounded-t-3xl shadow-lg px-8 py-6 bg-gray-100">


                    <PropertyList properties={properties} />


=======
            <div clas>
                <PropertyList properties={properties} />
>>>>>>> f8ac07a239b9057814424fcccc20ff674d890fa8
            </div>



            {/* Footer */}
            <Footer />

        </div>
    );
};

export default Welcome;
