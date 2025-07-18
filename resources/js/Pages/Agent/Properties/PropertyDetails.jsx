import AgentLayout from "@/Layouts/AgentLayout.jsx";
import ImageGallery from "@/Pages/Property/ImageGallery.jsx";
import DescriptionSection from "@/Pages/Property/DescriptionSection.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";

export default function PropertyDetails({property}){
    return (
        <AgentLayout>
            <div className='flex flex-col gap-y-6'>
                <ImageGallery images={property.images} image_url={property.image_url} />
                <DescriptionSection
                    title={property.title}
                    property_type={property.property_type}
                    sub_type={property.sub_type}
                    price={property.price}
                    address={property.address}
                    lot_area={property.lot_area}
                    floor_area={property.floor_area}
                    bedrooms={property.bedrooms}
                    total_rooms={property.total_rooms}
                    bathrooms={property.bathrooms}
                    car_slots={property.car_slots}
                    description={property.description}
                    features={property.features}
                />
                <PropertyMap coordinates={property.coordinate} />
            </div>

        </AgentLayout>
    );
}
