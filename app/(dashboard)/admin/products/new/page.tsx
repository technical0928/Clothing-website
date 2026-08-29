"use client";
import { DashboardSidebar, ProductImageUpload } from "@/components";
import apiClient from "@/lib/api";
import config from "@/lib/config";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import { parsePriceInput } from "@/lib/price";
import { computeSalePrice } from "@/lib/discount";
import { compressImage } from "@/lib/compressImage";
import { ProductImageItem } from "@/lib/productImages";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddNewProduct = () => {
  const [product, setProduct] = useState<{
    title: string;
    price: string;
    salePrice: string;
    discountPercent: string;
    manufacturer: string;
    inStock: number;
    mainImage: string;
    description: string;
    slug: string;
    categoryId: string;
    sizes: string;
    colors: string;
    fabric: string;
  }>({
    title: "",
    price: "",
    salePrice: "",
    discountPercent: "",
    manufacturer: "Noor-e-Multan",
    inStock: 1,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
    sizes: "",
    colors: "",
    fabric: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryLoadError, setCategoryLoadError] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    let payload: File = file;
    try {
      payload = await compressImage(file);
    } catch (error) {
      console.error("[uploadFile] compression failed, sending original:", error);
    }

    const formData = new FormData();
    formData.append("uploadedFile", payload);

    const response = await fetch(`${config.apiBaseUrl}/api/main-image`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.fileName) {
        return data.fileName;
      }
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Upload failed");
  }, []);

  const addProduct = async () => {
    const finalSlug = product.slug.trim() || convertSlugToURLFriendly(product.title.trim());
    const parsedPrice = parsePriceInput(product.price);

    if (
      product.title.trim() === "" ||
      product.manufacturer.trim() === "" ||
      product.description.trim() === "" ||
      finalSlug === "" ||
      !product.categoryId ||
      parsedPrice === null
    ) {
      toast.error("Please enter valid values in all required fields");
      return;
    }

    const doneImages = productImages.filter(
      (img) => img.status === "done" && img.fileName
    );

    if (doneImages.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    if (productImages.some((img) => img.status === "uploading")) {
      toast.error("Images are still uploading — please wait a moment");
      return;
    }

    if (productImages.some((img) => img.status === "failed")) {
      toast.error("Some images failed to upload — remove them and try again");
      return;
    }

    try {
      const discountNumber = product.discountPercent.trim() === ""
        ? null
        : Number(parseFloat(product.discountPercent));
      const parsedSalePrice = computeSalePrice(parsedPrice, discountNumber);

      const [primaryImage, ...galleryImages] = doneImages.map((img) => img.fileName);

      const productToSend = {
        ...product,
        slug: finalSlug,
        price: parsedPrice,
        salePrice: parsedSalePrice,
        mainImage: primaryImage,
        discountPercent: undefined,
      };

      const sanitizedProduct = sanitizeFormData(productToSend);
      const response = await apiClient.post(`/api/products`, sanitizedProduct);

      if (response.status === 201) {
        const data = await response.json();

        for (const galleryPath of galleryImages) {
          await apiClient.post("/api/images", {
            productID: data.id,
            image: galleryPath,
          });
        }

        await fetch("/api/admin/revalidate-products", { method: "POST" }).catch(
          () => undefined
        );
        toast.success("Product added successfully");
        setProductImages([]);
        setProduct({
          title: "",
          price: "",
          salePrice: "",
          discountPercent: "",
          manufacturer: "Noor-e-Multan",
          inStock: 1,
          mainImage: "",
          description: "",
          slug: "",
          categoryId: categories[0]?.id || "",
          sizes: "",
          colors: "",
          fabric: "",
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const fetchCategories = async () => {
    setCategoryLoading(true);
    setCategoryLoadError(null);

    try {
      const res = await apiClient.get(`/api/categories`);
      const data: Category[] = await res.json();
      setCategories(data || []);
      setProduct((prev) => ({
        ...prev,
        categoryId: prev.categoryId || data?.[0]?.id || "",
      }));
    } catch {
      setCategoryLoadError("Failed to load categories");
      toast.error("Failed to load categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      productImages.forEach((img) => {
        if (img.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [productImages]);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full pb-10">
        <h1 className="text-3xl font-semibold">Add new product</h1>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title}
              onChange={(e) =>
                setProduct({ ...product, title: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.slug}
              onChange={(e) =>
                setProduct({
                  ...product,
                  slug: e.target.value,
                })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId}
              onChange={(e) =>
                setProduct({ ...product, categoryId: e.target.value })
              }
            >
              {categoryLoading ? (
                <option value="" disabled>
                  Loading categories...
                </option>
              ) : categoryLoadError ? (
                <option value="" disabled>
                  Failed to load categories
                </option>
              ) : categories.length === 0 ? (
                <option value="" disabled>
                  No categories available
                </option>
              ) : (
                categories.map((category: any) => (
                  <option key={category?.id} value={category?.id}>
                    {category?.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price (PKR):</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="input input-bordered w-full max-w-xs"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: e.target.value })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Discount (%):</span>
            </div>
            <input
              type="number"
              min="0"
              max="95"
              step="1"
              className="input input-bordered w-full max-w-xs"
              placeholder="e.g. 40 for 40% off"
              value={product.discountPercent}
              onChange={(e) => {
                const nextValue = e.target.value;
                const discountNumber = nextValue.trim() === "" ? null : Number(parseFloat(nextValue));
                const parsedPrice = parsePriceInput(product.price);
                const nextSalePrice = computeSalePrice(parsedPrice, discountNumber);
                setProduct({
                  ...product,
                  discountPercent: nextValue,
                  salePrice: nextSalePrice === null ? "" : String(nextSalePrice),
                });
              }}
            />
          </label>
          {product.discountPercent.trim() !== "" && (
            <p className="text-sm mt-1 text-emerald-600 dark-sale-text font-medium">
              Sale price (auto): PKR{" "}
              {product.salePrice === "" ? "—" : Number(product.salePrice).toLocaleString()}
            </p>
          )}
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Brand:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product.manufacturer}
              onChange={(e) =>
                setProduct({ ...product, manufacturer: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Sizes (comma-separated, e.g. S,M,L,XL):</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="S,M,L,XL,XXL"
              value={product?.sizes}
              onChange={(e) =>
                setProduct({ ...product, sizes: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Colors (comma-separated, e.g. Black,White,Red):</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="Black,White,Navy"
              value={product.colors}
              onChange={(e) =>
                setProduct({ ...product, colors: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Fabric / Material:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="Lawn, Cotton, Silk, Chiffon, Khaddar"
              value={product.fabric}
              onChange={(e) =>
                setProduct({ ...product, fabric: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Stock quantity:</span>
            </div>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full max-w-xs"
              value={product.inStock}
              onChange={(e) =>
                setProduct({
                  ...product,
                  inStock: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                })
              }
            />
          </label>
        </div>

        <ProductImageUpload
          images={productImages}
          onChange={setProductImages}
          onUploadFile={uploadFile}
        />

        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
        <div className="flex gap-x-2">
          <button
            onClick={addProduct}
            type="button"
            className="uppercase bg-stone-900 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-stone-800 hover:text-white focus:outline-none focus:ring-2"
          >
            Add product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
