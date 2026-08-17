// *********************
// Role of the component: products section intended to be on the home page
// Name of the component: ProductsSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductsSection slug={slug} />
// Input parameters: no input parameters
// Output: products grid
// *********************

import React from "react";
import ProductCarousel from "./ProductCarousel";
import Heading from "./Heading";
import apiClient from "@/lib/api";

const ProductsSection = async () => {
  let products = [];
  
  try {
    // Fetch a bounded batch for the carousel only — never the whole catalog.
    // As the inventory grows past thousands of products the homepage stays
    // fast because it still only pulls this small, fixed slice.
    const data = await apiClient.get("/api/products?limit=12", {
      next: { revalidate: 30, tags: ["products"] },
    });
    
    if (!data.ok) {
      console.error('Failed to fetch products:', data.statusText);
      products = [];
    } else {
      const result = await data.json();
      // Ensure products is an array
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    products = [];
  }

  return (
    <div className="bg-amber-50 border-t-4 border-white">
      <div className="max-w-screen-2xl mx-auto pt-20 px-10 max-sm:px-5">
        <Heading title="FEATURED PRODUCTS" />
        <div className="py-10">
          {products.length > 0 ? (
            <ProductCarousel products={products} />
          ) : (
            <div className="text-center text-stone-900 py-10">
              <p>No products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
