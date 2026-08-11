// *********************
// Role of the component: Footer component
// Name of the component: Footer.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <Footer />
// Input parameters: no input parameters
// Output: Footer component with Noor-e-Multan branding
// *********************

import { navigation } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-stone-900" aria-labelledby="footer-heading">
      <div>
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 pt-24 pb-14">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            {/* TODO: Replace with real client logo image */}
            <div className="flex flex-col gap-y-4">
              <span className="text-3xl font-serif tracking-tight text-white">
                Noor-e-Multan
              </span>
              <p className="text-stone-300 text-sm max-w-xs">
                Curated Pakistani clothing — elegant formalwear, traditional lawn, and everyday pieces delivered nationwide.
              </p>
              <div className="flex items-center gap-x-3">
                <a href="https://instagram.com/noor-e-multan" target="_blank" rel="noreferrer" className="text-white hover:text-amber-300">
                  <FaInstagram size={18} />
                </a>
                <a href="https://tiktok.com/@noor-e-multan" target="_blank" rel="noreferrer" className="text-white hover:text-amber-300">
                  <FaTiktok size={18} />
                </a>
                <a href="https://wa.me/923017795702" target="_blank" rel="noreferrer" className="text-white hover:text-amber-300">
                  <FaWhatsapp size={18} />
                </a>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-lg font-bold leading-6 text-amber-400">
                    Sale
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.sale.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm leading-6 text-stone-300 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-base font-bold leading-6 text-amber-400">
                    About Us
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.about.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm leading-6 text-stone-300 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-base font-bold leading-6 text-amber-400">
                    Shopping
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.buy.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm leading-6 text-stone-300 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-base font-bold leading-6 text-amber-400">
                    Support
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.help.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm leading-6 text-stone-300 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-stone-700 pt-8">
            <p className="text-stone-400 text-sm text-center">
              DELIVERY ALL PAKISTAN — Experience Noor-e-Multan&apos;s curated clothing collections nationwide.
            </p>
            <p className="text-stone-500 text-sm text-center mt-3">
              &copy; {new Date().getFullYear()} Noor-e-Multan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
