import Navbar from "@/Components/NavBar.jsx";
import FeaturedProperties from "@/Components/FeaturedProperties.jsx";
import ParallaxFeatures from "@/Components/ParallaxFeatures.jsx";
import AboutUs from "@/Components/AboutUs.jsx";
import OurServices from "@/Components/OurServices.jsx";
import OurTeam from "@/Components/OurTeam.jsx";
import CTASection from "@/Components/CTASection.jsx";
import PropertyListings from "@/Components/PropertyListings.jsx";
import Footer from "@/Components/Footer.jsx";
import ParallaxHero from "@/Components/ParallaxHero.jsx";
import Testimonials from "@/Components/Testimonials.jsx";
import Chatbot from "@/Components/Chatbot/Chatbot.jsx";



export default function Welcome({featured, members}) {

    return (

        <div className="min-h-screen">
            <Navbar />
            <ParallaxHero />
            <FeaturedProperties  properties={featured}/>
            <ParallaxFeatures />
            <AboutUs />
            <OurServices />
            <OurTeam members={members} />
            <Testimonials />
            <CTASection />
            {/*<PropertyListings />*/}
            <Footer />
            <Chatbot/>
        </div>
    );
}
