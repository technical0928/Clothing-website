// *********************
// Role of the component: Header component
// Name of the component: Header.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <Header />
// Input parameters: no input parameters
// Output: Header component with Noor-e-Multan branding
// *********************

"use client";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import HeaderTop from "./HeaderTop";
import Image from "next/image";
import SearchInput from "./SearchInput";
import Link from "next/link";

import CartElement from "./CartElement";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import ThemeToggle from "./ThemeToggle";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { FaBars, FaXmark } from "react-icons/fa6";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "All Products" },
  { href: "/shop/men", label: "Men" },
  { href: "/shop/women", label: "Women" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const Header = () => {
  const pathname = usePathname();
  const { wishQuantity } = useWishlistStore();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };

  return (
    <header className="bg-white">
      <HeaderTop />
      {pathname.startsWith("/admin") === false && (
        <div className="h-32 bg-white flex items-center justify-between px-16 max-[1320px]:px-16 max-md:px-6 max-lg:flex-col max-lg:gap-y-7 max-lg:justify-center max-lg:h-60 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-x-4">
            <Image
              src="/noor-e-multan-logo.svg"
              alt="Noor-e-Multan logo"
              width={60}
              height={60}
              className="rounded-xl bg-amber-50"
            />
            <div className="flex flex-col items-start">
              <span className="text-3xl font-serif tracking-tight text-stone-900 max-[1023px]:text-2xl">
                Noor-e-Multan
              </span>
              <span className="text-sm italic text-stone-500">Unique Blend of Culture</span>
            </div>
          </Link>
          <SearchInput />
          <div className="flex gap-x-6 items-center max-md:gap-x-4">
            <ThemeToggle />
            <NotificationBell />
            <HeartElement wishQuantity={wishQuantity} />
            <CartElement />
          </div>
        </div>
      )}
      {pathname.startsWith("/admin") === false && (
        <nav className="border-t border-stone-100 bg-white">
          <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between px-16 max-md:px-6">
            <ul className="flex h-full items-center gap-x-8 text-sm font-semibold uppercase tracking-wide text-stone-700 max-md:hidden">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="h-full">
                  <Link
                    href={link.href}
                    className={`flex h-full items-center hover:text-amber-700 ${
                      pathname === link.href ? "text-amber-700" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-x-6">
              {session?.user && (
                <div className="hidden items-center gap-x-6 md:flex">
                  {(session.user as any)?.image ? (
                    <Link href="/profile" aria-label="My Profile">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/${(session.user as any).image}`}
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-amber-600 object-cover"
                      />
                    </Link>
                  ) : (
                    <Link
                      href="/profile"
                      className="text-sm font-semibold uppercase tracking-wide text-stone-700 hover:text-amber-700"
                    >
                      My Profile
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="text-sm font-semibold uppercase tracking-wide text-stone-700 hover:text-amber-700"
                  >
                    My Orders
                  </Link>
                </div>
              )}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((open) => !open)}
                className="md:hidden p-2 text-stone-800 hover:text-amber-700"
              >
                {mobileOpen ? (
                  <FaXmark className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="border-t border-stone-100 bg-white px-6 py-4 md:hidden">
              <ul className="flex flex-col gap-y-4 text-sm font-semibold uppercase tracking-wide text-stone-700">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block hover:text-amber-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {session?.user && (
                  <>
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="block hover:text-amber-700"
                      >
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/orders"
                        onClick={() => setMobileOpen(false)}
                        className="block hover:text-amber-700"
                      >
                        My Orders
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </nav>
      )}
      {pathname.startsWith("/admin") === true && (
        <div className="flex justify-between h-32 bg-white items-center px-16 max-[1320px]:px-10  max-w-screen-2xl mx-auto max-[400px]:px-5">
          <Link href="/" className="flex items-center gap-x-4">
            <Image
              src="/noor-e-multan-logo.svg"
              alt="Noor-e-Multan logo"
              width={60}
              height={60}
              className="rounded-xl bg-amber-50"
            />
            <div className="flex flex-col items-start">
              <span className="text-3xl font-serif tracking-tight text-stone-900">
                Noor-e-Multan
              </span>
              <span className="text-sm italic text-stone-500">Unique Blend of Culture</span>
            </div>
          </Link>
          <div className="flex gap-x-4 items-center">
            <ThemeToggle />
            <NotificationBell />
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="w-10">
                {(session as any)?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/${(session as any).user.image}`}
                    alt="admin profile photo"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src="/randomuser.jpg"
                    alt="admin profile photo"
                    width={30}
                    height={30}
                    className="w-full h-full rounded-full"
                  />
                )}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/admin">Dashboard</Link>
                </li>
                <li>
                  <Link href="/admin/settings">Profile</Link>
                </li>
                <li onClick={handleLogout}>
                  <a href="#">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
