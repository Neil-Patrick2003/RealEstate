import NavBar from "@/Components/NavBar.jsx";
import PropertyCard from "@/Components/Property/PropertyCard.jsx";
import {useEffect, useState} from "react";
import {router, Link} from "@inertiajs/react";
import {debounce} from "lodash";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapLocation} from "@fortawesome/free-solid-svg-icons";

export default function Properties({properties, search = '', type = '', subType = ''}){

    const [searchTerm, setSearchTerm] = useState(search || '');
    const [selectedType, setSelectedType] = useState(type || '');
    const [selectedSubtype, setSelectedSubtype] = useState(subType || '');
    const handleTypeChange = (e) => setSelectedType(e.target.value);
    const handleSubtypeChange = (e) => setSelectedType(e.target.value);


    const fetchFilteredResults = () => {
        router.get('/all-properties', {
            search: searchTerm,
            type: selectedType,
            subType: selectedSubtype,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const debouncedFetch = debounce(() => {
            fetchFilteredResults(1);
        }, 500);

        debouncedFetch();

        return () => debouncedFetch.cancel();
    }, [searchTerm, selectedType, selectedSubtype]);





    return(


        <div>
            <NavBar />
            <div className='flex flex-col items-center w-full justify-center mt-20'>
                <div className='flex-center-between max-w-7xl bg-gray-200  px-12 py-6 rounded-2xl gap-2'>

                    <div className='flex gap-2'>
                        <input
                            type="text"
                            placeholder="Search for agent names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className=" mb-2 p-2 border border-gray-300 rounded-md w-80 max-w-sm"
                        />
                        <select
                            value={selectedType}
                            onChange={handleTypeChange}

                            className=" mb-2 py-2 border border-gray-300 rounded-md">
                            <option value="">All</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Condominium">Condominium</option>
                            <option value="House">House</option>
                            <option value="Land">Land</option>
                        </select>

                    </div>
                    <div className='bg-primary px-4 rounded-md py-2 mb-2'>
                        <Link href='/maps'>
                            <FontAwesomeIcon icon={faMapLocation} className='w-5 h-5 text-white mr-2' />
                            <span className='text-white '>Map</span>
                        </Link>
                    </div>


                </div>

                <div className='grid gap-6 grid-cols-5 mt-8 '>
                    {properties.length === 0 && 'No properties yet'}
                    {properties.map((property) => (
                        <PropertyCard  property={property} />
                    ))}{properties.map((property) => (
                        <PropertyCard  property={property} />
                    ))}{properties.map((property) => (
                        <PropertyCard  property={property} />
                    ))}
                </div>
            </div>
        </div>
    );

}
