import React from 'react';
import Hero from './LandingPage/Hero';

const Welcome = ({ auth }) => {
  return (
    <div className="scrollbar-thin scrollbar-track-white scrollbar-thumb-slate-100 md:min-h-[88vh] min-h-[90vh] overflow-y-auto">
      <Hero auth={auth} />

      {/* Optional Welcome Section */}
      <section className="text-center px-4 py-8 bg-white dark:bg-gray-900">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Welcome to MJVI Realty
        </h2>
        <p className="mt-2 text-gray-100 dark:text-gray-300">
          Find your dream property with us — fast, reliable, and hassle-free.
        </p>
      </section>
    </div>
  );
};

export default Welcome;
