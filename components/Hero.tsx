// *********************
// Role of the component: Classical hero component on home page
// Name of the component: Hero.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <Hero />
// Input parameters: no input parameters
// Output: Fashion-themed hero banner with lifestyle copy
// *********************

import Link from "next/link";
import React from "react";

const Hero = () => {
  return (
    // TODO: Replace the background below with a real client hero/lifestyle photo
    // Real logo image can be added at public/noor-e-multan-logo.png and referenced in Header.
    <div className="h-[700px] w-full bg-gradient-to-br from-amber-100 via-cream to-stone-100 max-lg:h-[600px] max-md:h-[500px] relative overflow-hidden">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      
      <div className="flex flex-col items-center justify-center h-full text-center px-10 max-w-screen-2xl mx-auto relative z-10">
        <p className="text-amber-700 text-lg font-semibold tracking-[0.3em] uppercase mb-4 max-md:text-base">
          Noor-e-Multan
        </p>
        <h1 className="text-7xl text-stone-900 font-bold mb-6 max-xl:text-6xl max-md:text-5xl max-sm:text-4xl tracking-tight leading-tight">
          HERITAGE SILHOUETTES
          <br />
          <span className="text-amber-600">MEET MODERN LUXURY</span>
        </h1>
        <p className="text-stone-700 text-xl max-w-2xl mb-8 max-sm:text-base max-md:text-lg">
          Explore curated luxury ready-to-wear, lawn, kurtas, and formal pieces with delivery across Pakistan.
        </p>
        <div className="flex gap-x-4 max-lg:flex-col max-lg:gap-y-3">
          <Link href="/shop" className="bg-amber-500 text-stone-900 font-bold px-12 py-4 text-lg hover:bg-amber-400 transition-colors tracking-wide">
            SHOP NOW
          </Link>
          <Link href="/shop" className="bg-transparent border-2 border-amber-500 text-amber-600 font-bold px-12 py-4 text-lg hover:bg-amber-50 hover:text-amber-800 transition-colors tracking-wide">
            VIEW LOOKBOOK
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
