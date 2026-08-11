// *********************
// Role of the component: Simple slider component built with the help of slick-carousel
// Name of the component: SimpleSlider.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <SimpleSlider />
// Input parameters: no input parameters
// Output: Fashion-themed slider component
// *********************

"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";

function SimpleSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };
  return (
    <div className="slider-container max-w-screen-2xl mx-auto px-16 max-md:px-7">
      <Slider {...settings}>
        {/* Slide 1: Lawn Collection */}
        <div className="h-[500px] max-lg:h-[400px] max-md:h-[250px] max-[500px]:h-[200px] max-[400px]:h-[150px] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-stone-100 flex items-center">
            <div className="ml-16 max-md:ml-8 max-sm:ml-4">
              <p className="text-lg font-light text-amber-700 uppercase tracking-[0.2em] mb-3 max-md:text-sm max-md:mb-1">
                Lawn Collection
              </p>
              <h2 className="text-5xl font-bold text-stone-900 mb-4 max-[1162px]:text-4xl max-lg:mb-2 max-lg:text-3xl max-md:text-2xl max-md:mb-1 leading-tight">
                Comfort Meets<br />Elegance
              </h2>
              <p className="mb-5 text-stone-600 text-lg font-medium max-w-md max-[1162px]:text-base max-lg:mb-2 max-lg:text-sm max-md:mb-1 max-sm:hidden">
                Premium printed lawn suits crafted for the modern woman — breathable, 
                stylish, and perfect for every day.
              </p>
              <Link href="/shop" className="inline-block bg-stone-900 text-white px-8 py-3 text-lg font-semibold hover:bg-stone-700 transition-colors max-[1162px]:text-base max-lg:text-sm max-md:px-4 max-md:py-2">
                Shop now
              </Link>
            </div>
          </div>
        </div>

        {/* Slide 2: Formal Wear */}
        <div className="h-[500px] max-lg:h-[400px] max-md:h-[250px] max-[500px]:h-[200px] max-[400px]:h-[150px] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-stone-800 to-stone-900 flex items-center">
            <div className="ml-16 max-md:ml-8 max-sm:ml-4">
              <p className="text-lg font-light text-amber-400 uppercase tracking-[0.2em] mb-3 max-md:text-sm max-md:mb-1">
                Men&apos;s Formal
              </p>
              <h2 className="text-5xl font-bold text-white mb-4 max-[1162px]:text-4xl max-lg:mb-2 max-lg:text-3xl max-md:text-2xl max-md:mb-1 leading-tight">
                Dress to<br />Impress
              </h2>
              <p className="mb-5 text-stone-300 text-lg font-medium max-w-md max-[1162px]:text-base max-lg:mb-2 max-lg:text-sm max-md:mb-1 max-sm:hidden">
                Sharp formal shirts, tailored kurtas, and premium cotton tees — 
                elevate your wardrobe with confidence.
              </p>
              <Link href="/shop" className="inline-block bg-amber-400 text-stone-900 px-8 py-3 text-lg font-semibold hover:bg-amber-300 transition-colors max-[1162px]:text-base max-lg:text-sm max-md:px-4 max-md:py-2">
                Shop now
              </Link>
            </div>
          </div>
        </div>
      </Slider>
    </div>
  );
}

export default SimpleSlider;
