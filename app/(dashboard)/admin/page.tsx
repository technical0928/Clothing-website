"use client";
import { DashboardSidebar, StatsElement } from "@/components";
import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import apiClient from "@/lib/api";

interface DashboardStats {
  products: number;
  categories: number;
  merchants: number;
  users: number;
  orders: number;
  revenue: number;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    apiClient
      .get("/api/stats", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => {
        console.error("Failed to fetch dashboard stats:", error);
      });
  }, []);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex flex-col items-center ml-5 gap-y-4 w-full max-xl:ml-0 max-xl:px-2 max-xl:mt-5 max-md:gap-y-1">
        <div className="flex justify-between w-full max-md:flex-col max-md:w-full max-md:gap-y-1">
          <StatsElement
            title="Products"
            value={stats ? stats.products.toLocaleString() : "—"}
            change="Live from Neon"
          />
          <StatsElement
            title="Categories"
            value={stats ? stats.categories.toLocaleString() : "—"}
            change="Live from Neon"
          />
          <StatsElement
            title="Merchants"
            value={stats ? stats.merchants.toLocaleString() : "—"}
            change="Live from Neon"
          />
        </div>
        <div className="w-full bg-amber-600 text-white h-40 flex flex-col justify-center items-center gap-y-2">
          <h4 className="text-3xl text-amber-100 max-[400px]:text-2xl">
            Total Revenue
          </h4>
          <p className="text-3xl font-bold">
            PKR {stats ? stats.revenue.toLocaleString() : "—"}
          </p>
          <p className="text-green-300 flex gap-x-1 items-center">
            <FaArrowUp />
            {stats
              ? `${stats.orders} order${stats.orders === 1 ? "" : "s"} placed`
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
