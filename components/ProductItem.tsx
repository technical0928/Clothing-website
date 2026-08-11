// *********************
// Role of the component: Product item component 
// Name of the component: ProductItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component with clothing-style card showing image, title, price in PKR
// *********************

"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { FaHeart } from "react-icons/fa6";

import { sanitize } from "@/lib/sanitize";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const isFavorite = wishlist.some((item) => item.id === product.id);

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.mainImage,
      slug: product.slug,
      stockAvailabillity: product.inStock,
    });
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 350);
  };

  const hasSale = Boolean(product.salePrice) && (product.salePrice ?? 0) < product.price;
  const displayPrice = hasSale && product.salePrice ? product.salePrice : product.price;
  const discountPercent = hasSale && product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div className="group flex w-full max-w-[360px] flex-col items-center gap-y-3">
      <div className="relative w-full overflow-hidden bg-stone-100">
        {hasSale && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
            -{discountPercent}% Sale
          </span>
        )}
        <Link href={`/product/${product.slug}`} className="block w-full">
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            width={360}
            height={420}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            className="h-[300px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            alt={sanitize(product?.title) || "Product image"}
          />
        </Link>
        <button
          type="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          onClick={handleToggleWishlist}
          className={`absolute right-4 top-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-lg opacity-0 shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-red-200 group-hover:translate-y-0 group-hover:opacity-100 ${
            isFavorite ? "text-red-500" : "text-stone-600 hover:text-red-500"
          } ${isFavorite ? "translate-y-0 opacity-100" : ""} ${
            isAnimating ? "scale-125 ring-4 ring-red-200" : ""
          }`}
        >
          <FaHeart />
        </button>
      </div>
      <Link
        href={`/product/${product.slug}`}
        className="mt-2 text-center font-serif text-2xl font-semibold uppercase leading-tight text-stone-900 transition-colors hover:text-amber-700"
      >
        {sanitize(product.title)}
      </Link>
      <p className="flex items-center gap-x-2">
        <span className="text-lg font-bold text-amber-700">
          PKR {displayPrice.toLocaleString()}
        </span>
        {hasSale && (
          <span className="text-sm font-medium text-stone-400 line-through">
            PKR {product.price.toLocaleString()}
          </span>
        )}
      </p>

  
      <Link
        href={`/product/${product?.slug}`}
        className="flex w-full items-center justify-center border border-stone-300 bg-white px-0 py-3 text-base font-bold uppercase text-stone-900 shadow-sm transition-colors hover:bg-stone-900 hover:text-white focus:outline-none focus:ring-2"
      >
        <p>View product</p>
      </Link>
    </div>
  );
};

export default ProductItem;
