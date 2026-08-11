// *********************
// Role of the component: Product table component on admin dashboard page
// Name of the component: DashboardProductTable.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <DashboardProductTable />
// Input parameters: no input parameters
// Output: products table
// *********************

"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CustomButton from "./CustomButton";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiClient.get("/api/products?mode=admin", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      });
  }, []);

  const handleDeleteProduct = async (id: string) => {
    const shouldDelete = confirm(
      "Are you sure you want to delete this product? This cannot be undone."
    );
    if (!shouldDelete) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/products/${id}`);
      if (response.status === 204) {
        setProducts((current) => current.filter((product) => product.id !== id));
        toast.success("Product deleted successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("There was an error deleting the product");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-5">All products</h1>
      <div className="flex justify-end mb-5">
        <Link href="/admin/products/new">
          <CustomButton
            buttonType="button"
            customWidth="110px"
            paddingX={10}
            paddingY={5}
            textSize="base"
            text="Add new product"
          />
        </Link>
      </div>

      <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[80vh]">
        <table className="table table-md table-pin-cols">
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Product</th>
              <th>Stock Availability</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  No products yet. Create a new product to see it here.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <Image
                            width={48}
                            height={48}
                            src={product?.mainImage ? `/${product?.mainImage}` : "/product_placeholder.svg"}
                            alt={sanitize(product?.title) || "Product image"}
                            className="w-auto h-auto"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{sanitize(product?.title)}</div>
                        <div className="text-sm opacity-50">
                          {sanitize(product?.manufacturer)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    {product?.inStock ? (
                      <span className="badge badge-success text-white badge-sm">
                        In stock
                      </span>
                    ) : (
                      <span className="badge badge-error text-white badge-sm">
                        Out of stock
                      </span>
                    )}
                  </td>

                  <td>PKR {product?.price?.toLocaleString()}</td>
                  <td className="flex gap-2">
                    <Link href={`/admin/products/${product.id}`} className="btn btn-ghost btn-xs">
                      Edit
                    </Link>
                    <button
                      className="btn btn-error btn-xs text-white"
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardProductTable;
