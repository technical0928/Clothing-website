// *********************
// Role of the component: IntroducingSection with the text "Introducing Noor-e-Multan"
// Name of the component: IntroducingSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <IntroducingSection />
// Input parameters: no input parameters
// Output: Section with the text "Introducing Noor-e-Multan" and button
// *********************

import Link from "next/link";
import React from "react";

const IntroducingSection = () => {
  return (
    <div className="py-20 pt-24 bg-gradient-to-r from-amber-50 via-cream to-stone-100">
      <div className="text-center flex flex-col gap-y-5 items-center">
        <h2 className="text-charcoal text-8xl font-serif font-extrabold text-center mb-2 max-md:text-6xl max-[480px]:text-4xl tracking-tight">
          INTRODUCING <span className="text-amber-600">Noor-e-Multan</span>
        </h2>
        <div>
          <p className="text-charcoal text-center text-2xl font-semibold max-md:text-xl max-[480px]:text-base">
            A unique blend of tradition and contemporary Pakistani fashion.
          </p>
          <p className="text-charcoal text-center text-2xl font-semibold max-md:text-xl max-[480px]:text-base">
            Timeless ready-to-wear designed for celebrations, work, and everyday elegance.
          </p>
          <Link href="/shop" className="block text-charcoal bg-amber-400 font-bold px-12 py-3 text-xl hover:bg-amber-300 w-96 mt-2 max-md:text-lg max-md:w-72 max-[480px]:w-60 mx-auto transition-colors">
            SHOP NOW
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IntroducingSection;
