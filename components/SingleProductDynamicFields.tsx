"use client";
import React, { useState, useEffect, useMemo } from "react";
import QuantityInput from "./QuantityInput";
import AddToCartSingleProductBtn from "./AddToCartSingleProductBtn";
import BuyNowSingleProductBtn from "./BuyNowSingleProductBtn";

const SingleProductDynamicFields = ({ product }: { product: Product }) => {
  const [quantityCount, setQuantityCount] = useState<number>(1);

  const availableSizes = useMemo(
    () =>
      product?.sizes
        ? product.sizes.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    [product?.sizes]
  );
  const availableColors = useMemo(
    () =>
      product?.colors
        ? product.colors.split(",").map((c) => c.trim()).filter(Boolean)
        : [],
    [product?.colors]
  );

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || "");

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize((current) => current || availableSizes[0]);
    }
    if (availableColors.length > 0) {
      setSelectedColor((current) => current || availableColors[0]);
    }
  }, [availableSizes, availableColors]);

  return (
    <div className="flex flex-col gap-y-5">
      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <label className="text-base font-semibold text-stone-800">
            Select Size: {selectedSize && <span className="text-amber-600 ml-1">{selectedSize}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 text-sm font-medium border transition-all ${selectedSize === size
                  ? "border-stone-900 bg-stone-900 text-white shadow"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <label className="text-base font-semibold text-stone-800">
            Select Color: {selectedColor && <span className="text-amber-600 ml-1">{selectedColor}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 text-sm font-medium border transition-all ${selectedColor === color
                  ? "border-stone-900 bg-stone-900 text-white shadow"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                  }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <QuantityInput
        quantityCount={quantityCount}
        setQuantityCount={setQuantityCount}
      />
      {Boolean(product.inStock) && (
        <div className="flex gap-x-5 max-[500px]:flex-col max-[500px]:items-center max-[500px]:gap-y-1">
          <AddToCartSingleProductBtn
            quantityCount={quantityCount}
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />
          <BuyNowSingleProductBtn
            quantityCount={quantityCount}
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />
        </div>
      )}
    </div>
  );
};

export default SingleProductDynamicFields;
