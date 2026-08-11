"use client";

// *********************
// Role of the component: Component that displays all orders on admin dashboard page
// Name of the component: AdminOrders.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <AdminOrders />
// Input parameters: No input parameters
// Output: Table with all orders
// *********************

import React, { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "canceled"];

const statusColor: Record<string, string> = {
  pending: "text-amber-700 border-amber-300 bg-amber-50",
  processing: "text-blue-700 border-blue-300 bg-blue-50",
  shipped: "text-indigo-700 border-indigo-300 bg-indigo-50",
  delivered: "text-green-700 border-green-300 bg-green-50",
  canceled: "text-red-700 border-red-300 bg-red-50",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await apiClient.get("/api/orders");
      const data = await response.json();
      
      setOrders(data?.orders);
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiClient.patch(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (response.ok) {
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus as Order["status"] }
              : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="xl:ml-5 w-full max-xl:mt-5 ">
      <h1 className="text-3xl font-semibold text-center mb-5">All orders</h1>
      <div className="overflow-x-auto">
        <table className="table table-md table-pin-cols">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {orders && orders.length > 0 &&
              orders.map((order) => (
                <tr key={order?.id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>

                  <td>
                    <div>
                      <p className="font-bold">#{order?.id}</p>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-5">
                      <div>
                        <div className="font-bold">{order?.name}</div>
                        <div className="text-sm opacity-50">{order?.country}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <select
                      value={order?.status}
                      onChange={(e) => updateStatus(order?.id, e.target.value)}
                      aria-label={`Update status for order ${order?.id}`}
                      className={`select select-xs select-bordered font-semibold uppercase ${
                        statusColor[order?.status] || "text-stone-700 border-stone-300 bg-white"
                      }`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="bg-white font-normal normal-case text-stone-800"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <p>${order?.total}</p>
                  </td>

                  <td>{ new Date(Date.parse(order?.dateTime)).toDateString() }</td>
                  <th>
                    <Link
                      href={`/admin/orders/${order?.id}`}
                      className="btn btn-ghost btn-xs"
                    >
                      details
                    </Link>
                  </th>
                </tr>
              ))}
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th></th>
              <th>Order ID</th>
              <th>Name and country</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>Date</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
