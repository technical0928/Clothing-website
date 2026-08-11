"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaBoxOpen } from "react-icons/fa6";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    title: string;
    mainImage: string;
    price: number;
  };
}

interface CustomerOrder {
  id: string;
  name: string;
  lastname: string;
  email: string;
  status: string;
  total: number;
  dateTime: string;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  products: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  delivered: "badge-success",
  canceled: "badge-error",
};

const OrdersPage = () => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    apiClient
      .get(`/api/orders/user/${encodeURIComponent(session.user.email)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data) => {
        if (!cancelled) setOrders(Array.isArray(data?.orders) ? data.orders : []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.email, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <p className="text-lg text-stone-500">Loading your orders...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-2xl bg-white px-4 py-24 text-center">
        <FaBoxOpen className="mx-auto h-14 w-14 text-stone-300" />
        <h1 className="mt-4 font-serif text-4xl font-bold text-stone-900">My Orders</h1>
        <p className="mt-3 text-stone-600">
          Please log in to view your order history.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-stone-900 px-8 py-3 text-base font-bold uppercase text-white transition-colors hover:bg-stone-800"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-center font-serif text-4xl font-bold text-stone-900">
          My Orders
        </h1>
        <p className="mt-2 text-center text-stone-500">
          Signed in as {sanitize(session?.user?.email || "")}
        </p>

        {orders.length === 0 ? (
          <div className="mt-16 text-center">
            <FaBoxOpen className="mx-auto h-14 w-14 text-stone-300" />
            <p className="mt-4 text-lg text-stone-600">You have no orders yet.</p>
            <Link
              href="/shop"
              className="mt-6 inline-block bg-stone-900 px-8 py-3 text-base font-bold uppercase text-white transition-colors hover:bg-stone-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            {orders.map((order) => {
              const orderDate = order?.dateTime
                ? new Date(order.dateTime).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";
              return (
                <div
                  key={order.id}
                  className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
                    <div>
                      <p className="font-mono text-sm font-semibold text-stone-900">
                        #{order.id}
                      </p>
                      <p className="text-sm text-stone-500">{orderDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${statusColors[order.status] || "badge-ghost"} text-white`}>
                        {order.status}
                      </span>
                      {order.paymentMethod && (
                        <span
                          className={`badge ${
                            order.paymentStatus === "paid"
                              ? "badge-success"
                              : "badge-ghost"
                          }`}
                        >
                          {order.paymentMethod === "cod"
                            ? "COD"
                            : order.paymentMethod === "card"
                            ? "Card"
                            : order.paymentMethod === "jazzcash"
                            ? "JazzCash"
                            : order.paymentMethod === "easypaisa"
                            ? "Easypaisa"
                            : order.paymentMethod}
                          {order.paymentStatus === "paid" ? " · Paid" : ""}
                        </span>
                      )}
                      <p className="font-bold text-stone-900">
                        PKR {Math.round((order.total || 0) * 1.05).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <ul role="list" className="mt-4 divide-y divide-stone-100">
                    {Array.isArray(order.products) &&
                      order.products.map((item) => (
                        <li key={item.id} className="flex items-center gap-x-4 py-3">
                          <Image
                            src={item?.product?.mainImage ? `/${item.product.mainImage}` : "/product_placeholder.jpg"}
                            alt={sanitize(item?.product?.title) || "Product image"}
                            width={56}
                            height={56}
                            className="h-14 w-14 flex-none rounded-md object-cover"
                          />
                          <div className="flex-auto">
                            <Link
                              href={`/product/${item.product.slug}`}
                              className="font-medium text-stone-900 hover:text-amber-700"
                            >
                              {sanitize(item.product.title)}
                            </Link>
                            <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-stone-900">
                            PKR {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
