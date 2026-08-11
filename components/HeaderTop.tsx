// *********************
// Role of the component: Topbar of the header
// Name of the component: HeaderTop.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <HeaderTop />
// Input parameters: no input parameters
// Output: topbar with phone, email and login and register links
// *********************

"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaTiktok } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";

const HeaderTop = () => {
  const { data: session }: any = useSession();

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  }
  return (
    <div className="h-10 text-white bg-stone-900 max-lg:px-5 max-lg:h-16 max-[573px]:px-0">
      <div className="flex justify-between h-full max-lg:flex-col max-lg:justify-center max-lg:items-center max-w-screen-2xl mx-auto px-12 max-[573px]:px-0">
        <ul className="flex items-center h-full gap-x-5 max-[370px]:text-sm max-[370px]:gap-x-2">
          <li className="flex items-center gap-x-2 font-semibold">
            <FaWhatsapp className="text-amber-400" />
            <a href="https://wa.me/923017795702" target="_blank" rel="noreferrer" className="hover:text-amber-300">
              +92 301 7795702
            </a>
          </li>
          <li className="flex items-center gap-x-2 font-semibold">
            <FaInstagram className="text-amber-400" />
            <a href="https://instagram.com/noor-e-multan" target="_blank" rel="noreferrer" className="hover:text-amber-300">
              @noor-e-multan
            </a>
          </li>
          <li className="flex items-center gap-x-2 font-semibold">
            <FaTiktok className="text-amber-400" />
            <a href="https://tiktok.com/@noor-e-multan" target="_blank" rel="noreferrer" className="hover:text-amber-300">
              @noor-e-multan
            </a>
          </li>
        </ul>
        <ul className="flex items-center gap-x-5 h-full max-[370px]:text-sm max-[370px]:gap-x-2 font-semibold">
          {!session ? ( 
          <>
          <li className="flex items-center">
            <Link href="/login" className="flex items-center gap-x-2 font-semibold">
              <FaRegUser className="text-white" />
              <span>Login</span>
            </Link>
          </li>
          <li className="flex items-center">
            <Link href="/register" className="flex items-center gap-x-2 font-semibold">
              <FaRegUser className="text-white" />
              <span>Register</span>
            </Link>
          </li>
          </>
          ) :  (<>
          <span className="ml-10 text-base">{session.user?.email}</span>
          <li className="flex items-center">
            <Link href="/profile" className="flex items-center gap-x-2 font-semibold hover:text-amber-300">
              <FaRegUser className="text-white" />
              <span>Profile</span>
            </Link>
          </li>
          <li className="flex items-center">
            <Link href="/orders" className="flex items-center gap-x-2 font-semibold hover:text-amber-300">
              <FaRegUser className="text-white" />
              <span>My Orders</span>
            </Link>
          </li>
          <li className="flex items-center">
            <button onClick={() => handleLogout()} className="flex items-center gap-x-2 font-semibold">
              <FaRegUser className="text-white" />
              <span>Log out</span>
            </button>
          </li>
          </>)}
        </ul>
      </div>
    </div>
  );
};

export default HeaderTop;
