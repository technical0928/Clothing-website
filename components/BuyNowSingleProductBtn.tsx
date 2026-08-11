"use client";
import { useProductStore } from "@/app/_zustand/store";
import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface BuyNowBtnProps {
  product: Product;
  quantityCount: number;
  selectedSize?: string;
  selectedColor?: string;
}

const BuyNowSingleProductBtn = ({
  product,
  quantityCount,
  selectedSize,
  selectedColor,
}: BuyNowBtnProps) => {
  const router = useRouter();
  const { setBuyNowItem } = useProductStore();

  const hasSale =
    Boolean(product?.salePrice) && (product.salePrice ?? 0) < product.price;
  const effectivePrice =
    hasSale && product.salePrice ? product.salePrice : product.price;

  const handleBuyNow = () => {
    // Buy Now goes straight to checkout with ONLY this product.
    // It must NOT be added to the regular cart.
    setBuyNowItem({
      id: product?.id.toString(),
      title: product?.title,
      price: effectivePrice,
      image: product?.mainImage,
      amount: quantityCount,
      selectedSize,
      selectedColor,
    });
    toast.success("Taking you to checkout");
    router.push("/checkout");
  };
  return (
    <button
      onClick={handleBuyNow}
      className="btn w-[200px] text-lg border border-stone-900 hover:border-stone-900 border-1 font-normal bg-stone-900 text-white hover:bg-white hover:scale-110 hover:text-stone-900 transition-all uppercase ease-in max-[500px]:w-full"
    >
      Buy Now
    </button>
  );
};

export default BuyNowSingleProductBtn;
