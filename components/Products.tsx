// *********************
// Role of the component: Showing products on the shop page with applied filter and sort
// Name of the component: Products.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Products params={params} searchParams={searchParams} />
// Input parameters: { params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }
// Output: products grid
// *********************

import React from "react";
import ProductItem from "./ProductItem";
import apiClient from "@/lib/api";

const Products = async ({ params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }) => {
  const inStockChecked = searchParams?.inStock === undefined ? true : searchParams?.inStock === "true";
  const outOfStockChecked = searchParams?.outOfStock === undefined ? true : searchParams?.outOfStock === "true";
  const page = searchParams?.page ? Number(searchParams?.page) : 1;
  const categorySlug = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug;
  const sizeFilter = searchParams?.size ? String(searchParams?.size) : "";
  const colorFilter = searchParams?.color ? String(searchParams?.color) : "";

  const queryParams = new URLSearchParams();
  queryParams.set("filters[price][$lte]", String(searchParams?.price || 50000));
  queryParams.set("filters[rating][$gte]", String(Number(searchParams?.rating) || 0));
  queryParams.set("sort", String(searchParams?.sort || "defaultSort"));
  queryParams.set("page", String(page));

  if (sizeFilter) {
    queryParams.set("filters[size][$contains]", sizeFilter);
  }
  if (colorFilter) {
    queryParams.set("filters[color][$contains]", colorFilter);
  }

  if (!inStockChecked && !outOfStockChecked) {
    queryParams.set("filters[inStock][$gt]", "-1");
  } else if (inStockChecked && !outOfStockChecked) {
    queryParams.set("filters[inStock][$gte]", "1");
  } else if (!inStockChecked && outOfStockChecked) {
    queryParams.set("filters[inStock][$equals]", "0");
  }

  if (categorySlug && String(categorySlug).length > 0) {
    queryParams.set("filters[category][$equals]", String(categorySlug));
  }

  let products = [];

  try {
    const data = await apiClient.get(`/api/products?${queryParams.toString()}`, {
      next: { revalidate: 30, tags: ["products"] },
    });

    if (!data.ok) {
      console.error("Failed to fetch products:", data.statusText);
      products = [];
    } else {
      const result = await data.json();
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    products = [];
  }

  return (
    <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1">
      {products.length > 0 ? (
        products.map((product: any) => (
          <ProductItem key={product.id} product={product} color="black" />
        ))
      ) : (
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
          No products found for specified query
        </h3>
      )}
    </div>
  );
};

export default Products;
