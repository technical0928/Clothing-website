import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FaCircleCheck } from "react-icons/fa6";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

export const revalidate = 0;

interface OrderProduct {
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

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

const OrderConfirmationPage = async ({ params }: OrderConfirmationPageProps) => {
  const { orderId } = await params;

  let order: any = null;
  let orderProducts: OrderProduct[] = [];

  try {
    const orderResponse = await apiClient.get(`/api/orders/${orderId}`, {
      cache: "no-store",
    });
    if (orderResponse.ok) {
      order = await orderResponse.json();
    }
  } catch (error) {
    order = null;
  }

  if (!order || !order.id) {
    notFound();
  }

  try {
    const productsResponse = await apiClient.get(`/api/order-product/${order.id}`, {
      cache: "no-store",
    });
    if (productsResponse.ok) {
      const data = await productsResponse.json();
      orderProducts = Array.isArray(data) ? data : [];
    }
  } catch (error) {
    orderProducts = [];
  }

  const orderDate = order?.dateTime
    ? new Date(order.dateTime).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <FaCircleCheck className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 font-serif text-4xl font-bold text-stone-900">
            Thank you for your order!
          </h1>
          <p className="mt-3 text-lg text-stone-600">
            Your order has been placed successfully. You will be contacted for
            payment and delivery details.
          </p>
          <div className="mt-6 inline-block rounded-lg border border-stone-200 bg-stone-50 px-6 py-4">
            <p className="text-sm text-stone-500">Order number</p>
            <p className="mt-1 font-mono text-lg font-semibold text-stone-900">
              #{order?.id}
            </p>
          </div>
        </div>

        {orderProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-stone-900">
              Items in this order
            </h2>
            <ul role="list" className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
              {orderProducts.map((item) => (
                <li key={item.id} className="flex items-center gap-x-4 py-4">
                  <Image
                    src={item?.product?.mainImage ? `/${item.product.mainImage}` : "/product_placeholder.jpg"}
                    alt={sanitize(item?.product?.title) || "Product image"}
                    width={64}
                    height={64}
                    className="h-16 w-16 flex-none rounded-md object-cover"
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
                  <p className="font-semibold text-stone-900">
                    PKR {(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-600">Subtotal</dt>
                <dd className="font-medium text-stone-900">PKR {order?.total?.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600">Shipping</dt>
                <dd className="font-medium text-stone-900">Free</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600">Tax (5%)</dt>
                <dd className="font-medium text-stone-900">
                  PKR {Math.round((order?.total || 0) * 0.05).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 text-base">
                <dt className="font-semibold text-stone-900">Total</dt>
                <dd className="font-bold text-stone-900">
                  PKR {Math.round((order?.total || 0) * 1.05).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-8 rounded-lg bg-stone-50 p-5 text-sm text-stone-600">
              <p>
                <span className="font-semibold text-stone-900">Shipping to:</span>{" "}
                {sanitize(order?.name)} {sanitize(order?.lastname)}, {sanitize(order?.adress)},
                {sanitize(order?.city)}, {sanitize(order?.country)} — {sanitize(order?.postalCode)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-stone-900">Status:</span>{" "}
                <span className="capitalize">{order?.status || "pending"}</span>
                {orderDate && <> · Placed on {orderDate}</>}
              </p>
              {order?.paymentMethod && (
                <p className="mt-1">
                  <span className="font-semibold text-stone-900">Payment:</span>{" "}
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : order.paymentMethod === "card"
                    ? "Debit / Credit Card"
                    : order.paymentMethod === "jazzcash"
                    ? "JazzCash"
                    : order.paymentMethod === "easypaisa"
                    ? "Easypaisa"
                    : order.paymentMethod}{" "}
                  <span
                    className={`ml-1 rounded px-2 py-0.5 text-xs font-semibold ${
                      order.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="w-full bg-stone-900 px-8 py-3 text-center text-base font-bold uppercase text-white transition-colors hover:bg-stone-800 sm:w-auto"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="w-full border border-stone-300 bg-white px-8 py-3 text-center text-base font-bold uppercase text-stone-900 transition-colors hover:bg-stone-900 hover:text-white sm:w-auto"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
