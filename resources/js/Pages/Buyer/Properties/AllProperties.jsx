import MapView from "@/Pages/Buyer/Properties/MapView.jsx";
import NavBar from "@/Components/NavBar.jsx";
import { useState } from "react";
import Drawer from "@/Components/Drawer.jsx";

export default function AllProperties({ properties }) {
    const [open, setOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const handleMarkerClick = (property) => {
        setSelectedProperty(property);
        setOpen(true);
    };

    return (
        <div>
            <NavBar />
            <div className="mt-[60px] relative h-[calc(100vh-60px)]">

                <div className="relative h-screen w-screen z-0">
                    <MapView properties={properties} onMarkerClick={handleMarkerClick} />
                </div>


                {selectedProperty && (
                    <Drawer open={open} setOpen={setOpen} title={selectedProperty?.title}>
                        {selectedProperty && (
                            <div>
                                <img
                                    src={`/storage/${selectedProperty.image_url}`}
                                    alt={selectedProperty.title}
                                    className="w-full h-[160px] object-cover rounded mb-4"
                                />
                                <p className="text-green-600 font-bold text-lg">
                                    ₱{parseFloat(selectedProperty.price).toLocaleString()}
                                </p>
                                <p className="text-gray-600 text-sm mb-4">{selectedProperty.address}</p>
                                <a
                                    href={`/property/${selectedProperty.id}`}
                                    className="inline-block bg-primary text-white px-4 py-2 rounded font-medium hover:bg-accent transition"
                                >
                                    View Full Details
                                </a>
                            </div>
                        )}
                    </Drawer>

                )}
            </div>
        </div>
    );
}
