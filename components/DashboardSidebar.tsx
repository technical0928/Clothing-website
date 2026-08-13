// *********************
// Role of the component: Sidebar on admin dashboard page
// Name of the component: DashboardSidebar.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <DashboardSidebar />
// Input parameters: no input parameters
// Output: sidebar for admin dashboard page with unread contact message badge
// *********************

"use client";

import React, { useEffect, useState } from "react";
import { MdDashboard } from "react-icons/md";
import { FaTable } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaBagShopping } from "react-icons/fa6";
import { FaStore } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa6";
import apiClient from "@/lib/api";

import Link from "next/link";

const DashboardSidebar = () => {
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchUnread = async () => {
      try {
        const res = await apiClient.get("/api/contact?read=false&limit=1", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active && typeof data.unreadCount === "number") {
          setUnreadMessages(data.unreadCount);
        }
      } catch (error) {
        // Silent — badge just stays hidden when the API is unreachable
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="xl:w-[400px] bg-stone-900 h-full max-xl:w-full">
      <Link href="/admin">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <MdDashboard className="text-2xl" />{" "}
          <span className="font-normal">Dashboard</span>
        </div>
      </Link>
      <Link href="/admin/orders">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <FaBagShopping className="text-2xl" />{" "}
          <span className="font-normal">Orders</span>
        </div>
      </Link>
      <Link href="/admin/products">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <FaTable className="text-2xl" />{" "}
          <span className="font-normal">Products</span>
        </div>
      </Link>
      <Link href="/admin/bulk-upload">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <FaFileUpload className="text-2xl" />{" "}
          <span className="font-normal">Bulk Upload</span>
        </div>
      </Link>
      <Link href="/admin/categories">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <MdCategory className="text-2xl" />{" "}
          <span className="font-normal">Categories</span>
        </div>
      </Link>
      <Link href="/admin/users">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <FaRegUser className="text-2xl" />{" "}
          <span className="font-normal">Users</span>
        </div>
      </Link>
      <Link href="/admin/messages">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <FaEnvelope className="text-2xl" />{" "}
          <span className="font-normal">Messages</span>
          {unreadMessages > 0 && (
            <span className="ml-auto mr-5 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-sm font-bold text-white">
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          )}
        </div>
      </Link>
      <Link href="/admin/merchant">
        <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
          <FaStore className="text-2xl" />{" "}
          <span className="font-normal">Merchant</span>
        </div>
      </Link>
        <Link href="/admin/settings">
            <div className="flex gap-x-2 w-full hover:bg-stone-700 cursor-pointer items-center py-6 pl-5 text-xl text-white">
                <FaGear className="text-2xl" />{" "}
                <span className="font-normal">Settings</span>
            </div>
        </Link>
    </div>
  );
};

export default DashboardSidebar;
