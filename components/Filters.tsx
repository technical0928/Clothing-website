// *********************
// Role of the component: Filters on shop page
// Name of the component: Filters.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <Filters />
// Input parameters: no input parameters
// Output: stock, rating, price, size and color filter
// *********************

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSortStore } from "@/app/_zustand/sortStore";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import apiClient from "@/lib/api";

interface InputCategory {
  inStock: { text: string, isChecked: boolean },
  outOfStock: { text: string, isChecked: boolean },
  priceFilter: { text: string, value: number },
  ratingFilter: { text: string, value: number },
}

const Filters = () => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  // getting current page number from Zustand store
  const { page } = usePaginationStore();

  const [inputCategory, setInputCategory] = useState<InputCategory>({
    inStock: { text: "instock", isChecked: true },
    outOfStock: { text: "outofstock", isChecked: true },
    priceFilter: { text: "price", value: 50000 },
    ratingFilter: { text: "rating", value: 0 },
  });
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const { sortBy } = useSortStore();

  // Load unique sizes/colors from the catalog to build filter options
  useEffect(() => {
    let cancelled = false;
    apiClient.get("/api/products?mode=admin")
      .then((res) => res.json())
      .then((products: any[]) => {
        if (cancelled || !Array.isArray(products)) return;
        const sizes = new Set<string>();
        const colors = new Set<string>();
        products.forEach((product: any) => {
          String(product?.sizes || "").split(",").map((s: string) => s.trim()).filter(Boolean)
            .forEach((s: string) => sizes.add(s));
          String(product?.colors || "").split(",").map((c: string) => c.trim()).filter(Boolean)
            .forEach((c: string) => colors.add(c));
        });
        setAvailableSizes(Array.from(sizes));
        setAvailableColors(Array.from(colors));
      })
      .catch(() => { /* keep filters empty if fetch fails */ });
    return () => { cancelled = true; };
  }, []);

  // Sync selection with URL on back/forward navigation
  useEffect(() => {
    setSelectedSize(searchParams?.get("size") || "");
    setSelectedColor(searchParams?.get("color") || "");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    // setting URL params and after that putting them all in URL
    params.set("outOfStock", inputCategory.outOfStock.isChecked.toString());
    params.set("inStock", inputCategory.inStock.isChecked.toString());
    params.set("rating", inputCategory.ratingFilter.value.toString());
    params.set("price", inputCategory.priceFilter.value.toString());
    params.set("sort", sortBy);
    params.set("page", page.toString());
    if (selectedSize) {
      params.set("size", selectedSize);
    }
    if (selectedColor) {
      params.set("color", selectedColor);
    }
    replace(`${pathname}?${params}`);
  }, [inputCategory, sortBy, page, pathname, replace, selectedSize, selectedColor]);

  const sizeOptions = useMemo(() => availableSizes, [availableSizes]);
  const colorOptions = useMemo(() => availableColors, [availableColors]);

  return (
    <div>
      <h3 className="text-2xl mb-2">Filters</h3>
      <div className="divider"></div>
      <div className="flex flex-col gap-y-1">
        <h3 className="text-xl mb-2">Availability</h3>
        <div className="form-control">
          <label className="cursor-pointer flex items-center">
            <input
              type="checkbox"
              checked={inputCategory.inStock.isChecked}
              onChange={() =>
                setInputCategory({
                  ...inputCategory,
                  inStock: {
                    text: "instock",
                    isChecked: !inputCategory.inStock.isChecked,
                  },
                })
              }
              className="checkbox"
            />
            <span className="label-text text-lg ml-2 text-black">In stock</span>
          </label>
        </div>

        <div className="form-control">
          <label className="cursor-pointer flex items-center">
            <input
              type="checkbox"
              checked={inputCategory.outOfStock.isChecked}
              onChange={() =>
                setInputCategory({
                  ...inputCategory,
                  outOfStock: {
                    text: "outofstock",
                    isChecked: !inputCategory.outOfStock.isChecked,
                  },
                })
              }
              className="checkbox"
            />
            <span className="label-text text-lg ml-2 text-black">
              Out of stock
            </span>
          </label>
        </div>
      </div>

      <div className="divider"></div>
      <div className="flex flex-col gap-y-1">
        <h3 className="text-xl mb-2">Price</h3>
        <div>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={inputCategory.priceFilter.value}
            className="range"
            onChange={(e) =>
              setInputCategory({
                ...inputCategory,
                priceFilter: {
                  text: "price",
                  value: Number(e.target.value),
                },
              })
            }
          />
          <span>{`Max price: PKR ${inputCategory.priceFilter.value.toLocaleString()}`}</span>
        </div>
      </div>

      <div className="divider"></div>

      <div>
        <h3 className="text-xl mb-2">Minimum Rating:</h3>
        <input
          type="range"
          min={0}
          max="5"
          value={inputCategory.ratingFilter.value}
          onChange={(e) =>
            setInputCategory({
              ...inputCategory,
              ratingFilter: { text: "rating", value: Number(e.target.value) },
            })
          }
          className="range range-info"
          step="1"
        />
        <div className="w-full flex justify-between text-xs px-2">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      {sizeOptions.length > 0 && (
        <>
          <div className="divider"></div>
          <div>
            <h3 className="text-xl mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                  className={`px-3 py-1.5 text-sm font-medium border transition-all ${
                    selectedSize === size
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {selectedSize && (
              <button
                type="button"
                onClick={() => setSelectedSize("")}
                className="mt-2 text-xs text-stone-500 underline hover:text-stone-900"
              >
                Clear size ({selectedSize})
              </button>
            )}
          </div>
        </>
      )}

      {colorOptions.length > 0 && (
        <>
          <div className="divider"></div>
          <div>
            <h3 className="text-xl mb-2">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
                  className={`px-3 py-1.5 text-sm font-medium border transition-all ${
                    selectedColor === color
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
            {selectedColor && (
              <button
                type="button"
                onClick={() => setSelectedColor("")}
                className="mt-2 text-xs text-stone-500 underline hover:text-stone-900"
              >
                Clear color ({selectedColor})
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Filters;
