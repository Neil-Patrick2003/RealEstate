import MapView from "@/Pages/Buyer/Properties/MapView.jsx";

export default function AllProperties({properties}){
    return(
        <div>
            <MapView properties={properties} />
        </div>
    );
}
