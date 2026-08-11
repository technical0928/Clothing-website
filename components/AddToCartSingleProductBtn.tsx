"use client";

import React from "react";
import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";

interface AddToCartBtnProps {
  product: Product;
  quantityCount: number;
  selectedSize?: string;
  selectedColor?: string;
}

const AddToCartSingleProductBtn = ({
  product,
  quantityCount,
  selectedSize,
  selectedColor,
}: AddToCartBtnProps) => {
  const { addToCart } = useProductStore();

  const hasSale =
    Boolean(product?.salePrice) && (product.salePrice ?? 0) < product.price;
  const effectivePrice =
    hasSale && product.salePrice ? product.salePrice : product.price;

  const handleAddToCart = () => {
    addToCart({
      id: product?.id.toString(),
      title: product?.title,
      price: effectivePrice,
      image: product?.mainImage,
      amount: quantityCount,
      selectedSize,
      selectedColor,
    });
    toast.success("Product added to the cart");
  };
  return (
    <button
      onClick={handleAddToCart}
      className="btn w-[200px] text-lg border border-gray-300 border-1 font-normal bg-white text-stone-800 hover:bg-stone-900 hover:text-white hover:border-stone-900 hover:scale-110 transition-all uppercase ease-in max-[500px]:w-full"
    >
      Add to cart
    </button>
  );
};

export default AddToCartSingleProductBtn;
