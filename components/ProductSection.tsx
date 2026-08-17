// *********************
// Role of the component: A single homepage product section — a heading plus a
// horizontal carousel. Each section fetches ONLY its own bounded batch from
// the API (mode=section&section=<name>), so the homepage never loads the
// whole catalog even when the database grows to 20,000+ products.
// Name of the component: ProductSection.tsx
// Input parameters: { title, section, limit?, autoScroll? }
// *********************

import React from "react";
import ProductCarousel from "./ProductCarousel";
import apiClient from "@/lib/api";

interface ProductSectionProps {
  title: string;
  section: string;
  limit?: number;
  autoScroll?: boolean;
  linkHref?: string;
  linkLabel?: string;
}

const ProductSection = async ({
  title,
  section,
  limit = 12,
  autoScroll = true,
  linkHref,
  linkLabel = "View all",
}: ProductSectionProps) => {
  let products = [];

  try {
    const data = await apiClient.get(
      `/api/products?mode=section&section=${encodeURIComponent(section)}&limit=${limit}`,
      { next: { revalidate: 30, tags: ["products"] } }
    );

    if (!data.ok) {
      console.error(`Failed to fetch products for section "${section}":`, data.statusText);
      products = [];
    } else {
      const result = await data.json();
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error(`Error fetching products for section "${section}":`, error);
    products = [];
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="pt-16 pb-10">
      <div className="relative mb-8">
        <h2 className="text-center font-serif text-4xl font-bold uppercase tracking-wide text-stone-900 max-lg:text-3xl max-sm:text-2xl">
          {title}
        </h2>
        {linkHref && (
          <a
            href={linkHref}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-semibold uppercase tracking-wide text-stone-600 transition-colors hover:text-amber-700"
          >
            {linkLabel} →
          </a>
        )}
      </div>
      <ProductCarousel products={products} autoScroll={autoScroll} />
    </section>
  );
};

export default ProductSection;
