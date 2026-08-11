"use client"

import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";
import Image from "next/image"
import Link from "next/link";
import { FaBagShopping, FaCheck, FaCircleQuestion, FaClock, FaXmark } from "react-icons/fa6";
import QuantityInputCart from "@/components/QuantityInputCart";
import { sanitize } from "@/lib/sanitize";

export const CartModule = () => {

  const { products, removeFromCart, total } =
    useProductStore();

  const handleRemoveItem = (id: string, selectedSize?: string, selectedColor?: string) => {
    removeFromCart(id, selectedSize, selectedColor);
    toast.success("Product removed from the cart");
  };

  if (products.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center gap-y-6 rounded-lg border border-dashed border-stone-200 px-6 py-20 text-center">
        <FaBagShopping className="h-16 w-16 text-stone-300" />
        <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="max-w-sm text-stone-600">
          Looks like you haven&apos;t added anything yet. Explore our collection and find
          something you love.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-stone-900 px-8 py-3 font-bold uppercase text-white hover:bg-stone-800"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (

    <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      <section aria-labelledby="cart-heading" className="lg:col-span-7">
        <h2 id="cart-heading" className="sr-only">
          Items in your shopping cart
        </h2>

        <ul
          role="list"
          className="divide-y divide-gray-200 border-b border-t border-gray-200"
        >
          {products.map((product) => (
            <li
              key={`${product.id}_${product.selectedSize || ""}_${product.selectedColor || ""}`}
              className="flex py-6 sm:py-10"
            >
              <div className="flex-shrink-0">
                <Image
                  width={192}
                  height={192}
                  src={product?.image ? `/${product.image}` : "/product_placeholder.jpg"}
                  alt="product image"
                  className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                />
              </div>

              <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-sm">
                        <Link
                          href={`#`}
                          className="font-medium text-gray-700 hover:text-gray-800"
                        >
                          {sanitize(product.title)}
                        </Link>
                      </h3>
                    </div>
                    {(product.selectedSize || product.selectedColor) && (
                      <div className="mt-1 flex text-sm text-stone-600 gap-x-3">
                        {product.selectedSize && <span>Size: <strong className="text-stone-900">{product.selectedSize}</strong></span>}
                        {product.selectedColor && <span>Color: <strong className="text-stone-900">{product.selectedColor}</strong></span>}
                      </div>
                    )}
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      PKR {product.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:pr-9">
                    <QuantityInputCart product={product} />
                    <div className="absolute right-0 top-0">
                      <button
                        onClick={() => handleRemoveItem(product.id, product.selectedSize, product.selectedColor)}
                        type="button"
                        className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Remove</span>
                        <FaXmark className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                  {1 ? (
                    <FaCheck
                      className="h-5 w-5 flex-shrink-0 text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaClock
                      className="h-5 w-5 flex-shrink-0 text-gray-300"
                      aria-hidden="true"
                    />
                  )}

                  <span>{1 ? "In stock" : `Ships in 3 days`}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Order summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h2
          id="summary-heading"
          className="text-lg font-medium text-gray-900"
        >
          Order summary
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">Subtotal</dt>
            <dd className="text-sm font-medium text-gray-900">
              PKR {total.toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex items-center text-sm text-gray-600">
              <span>Shipping estimate</span>
              <a
                href="#"
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">
                  Learn more about how shipping is calculated
                </span>
                <FaCircleQuestion
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </a>
            </dt>
            <dd className="text-sm font-medium text-gray-900">Free</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex text-sm text-gray-600">
              <span>Tax estimate</span>
              <a
                href="#"
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">
                  Learn more about how tax is calculated
                </span>
                <FaCircleQuestion
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </a>
            </dt>
            <dd className="text-sm font-medium text-gray-900">
              PKR {Math.round(total * 0.05).toLocaleString()}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">
              Order total
            </dt>
            <dd className="text-base font-medium text-gray-900">
              PKR {total === 0 ? 0 : Math.round(total + total * 0.05).toLocaleString()}
            </dd>
          </div>
        </dl>
        {products.length > 0 && (
          <div className="mt-6">
            <Link
              href="/checkout"
              className="block flex justify-center items-center w-full uppercase bg-white px-4 py-3 text-base border border-stone-300 font-bold text-stone-800 shadow-sm hover:bg-stone-900 hover:text-white transition-colors focus:outline-none focus:ring-2"
            >
              <span>Checkout</span>
            </Link>
          </div>
        )}
      </section>
    </form>

  )

}
