"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTrash } from "react-icons/fa6";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import toast from "react-hot-toast";
import { sanitize } from "@/lib/sanitize";

interface WishItemProps {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
}

const WishItem = ({
  id,
  title,
  price,
  image,
  slug,
  stockAvailabillity,
}: WishItemProps) => {
  const { removeFromWishlist } = useWishlistStore();

  const handleRemove = () => {
    removeFromWishlist(id);
    toast.success("Item removed from favorites");
  };

  return (
    <tr className="border-b">
      <td>
        <button
          onClick={handleRemove}
          className="p-2 text-red-500 hover:text-red-700"
          type="button"
        >
          <FaTrash />
        </button>
      </td>
      <td className="py-4">
        <div className="flex justify-center">
          <Image
            src={image ? `/${image}` : "/product_placeholder.svg"}
            alt={title || "Product image"}
            width={80}
            height={80}
            className="h-20 w-20 rounded-md object-cover"
          />
        </div>
      </td>
      <td className="font-semibold text-stone-900">
        <Link href={`/product/${slug}`} className="hover:underline">
          {sanitize(title)}
        </Link>
        <p className="text-sm font-medium text-stone-600">
          PKR {price?.toLocaleString()}
        </p>
      </td>
      <td>
        {stockAvailabillity > 0 ? (
          <span className="badge badge-success text-white">In Stock</span>
        ) : (
          <span className="badge badge-error text-white">Out of Stock</span>
        )}
      </td>
      <td>
        <Link
          href={`/product/${slug}`}
          className="btn btn-sm bg-stone-900 text-white hover:bg-stone-800"
        >
          View Product
        </Link>
      </td>
    </tr>
  );
};

export default WishItem;
