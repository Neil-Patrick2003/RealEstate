import AgentLayout from "@/Layouts/AgentLayout.jsx";
import ImageGallery from "@/Pages/Property/ImageGallery.jsx";
import DescriptionSection from "@/Pages/Property/DescriptionSection.jsx";
import PropertyMap from "@/Components/PropertyMap.jsx";
import SingleProperty from "@/Components/Property/SingleProperty.jsx";
import {usePage} from "@inertiajs/react";

export default function PropertyDetails({property}){
    const auth = usePage().props.auth.user;
    return (
        <AgentLayout>
            <SingleProperty property={property} auth={auth} />
        </AgentLayout>
    );
}
