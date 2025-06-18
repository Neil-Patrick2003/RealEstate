import React from 'react';
import Hero from './LandingPage/Hero';
import NavBar from '@/Components/NavBar';
import PropertyList from './LandingPage/PropertyList';
import Footer from './LandingPage/Footer';

const Welcome = ({ auth }) => {
  return (
    <div className="scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100 md:min-h-[88vh] min-h-[90vh] overflow-y-auto">
      <NavBar/>
      <Hero auth={auth} />
      <PropertyList/>
      <Footer/>
    </div>
  );
};

export default Welcome;
