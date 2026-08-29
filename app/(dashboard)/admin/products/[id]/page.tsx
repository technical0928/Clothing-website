"use client";
import { DashboardSidebar, ProductImageUpload } from "@/components";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import config from "@/lib/config";
import { parsePriceInput } from "@/lib/price";
import { computeSalePrice, computeDiscountPercent } from "@/lib/discount";
import { compressImage } from "@/lib/compressImage";
import { ProductImageItem } from "@/lib/productImages";

export default function DashboardProductDetails({ params }: any) {
  const id = params?.id;

  const [product, setProduct] = useState<Product>();
  const [priceInput, setPriceInput] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);
  const [imagesInitialized, setImagesInitialized] = useState(false);
  const router = useRouter();

  // functionality for deleting product
  const deleteProduct = async () => {
    const requestOptions = {
      method: "DELETE",
    };
    apiClient
      .delete(`/api/products/${id}`, requestOptions)
      .then((response) => {
        if (response.status !== 204) {
          if (response.status === 400) {
            toast.error(
              "Cannot delete the product because of foreign key constraint"
            );
          } else {
            throw Error("There was an error while deleting product");
          }
        } else {
          toast.success("Product deleted successfully");
          router.push("/admin/products");
        }
      })
      .catch((error) => {
        toast.error("There was an error while deleting product");
      });
  };

  const syncGalleryImages = async (doneImages: ProductImageItem[]) => {
    const galleryPaths = doneImages.slice(1).map((img) => img.fileName);
    const existingPaths = new Set(otherImages.map((img) => img.image));
    const keptPaths = new Set(galleryPaths);

    for (const existing of otherImages) {
      if (!keptPaths.has(existing.image)) {
        await apiClient.delete(`/api/images/${existing.imageID}`);
      }
    }

    for (const path of galleryPaths) {
      if (!existingPaths.has(path)) {
        await apiClient.post("/api/images", {
          productID: id,
          image: path,
        });
      }
    }

    await refreshGalleryImages();
  };

  // functionality for updating product
  const updateProduct = async () => {
    const parsedPrice = parsePriceInput(priceInput);

    if (
      product?.title === "" ||
      product?.slug === "" ||
      priceInput.trim() === "" ||
      parsedPrice === null ||
      product?.manufacturer === "" ||
      product?.description === ""
    ) {
      toast.error("You need to enter values in input fields");
      return;
    }

    const doneImages = productImages.filter(
      (img) => img.status === "done" && img.fileName
    );

    if (doneImages.length === 0) {
      toast.error("At least one product image is required");
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
      const discountNumber = discountPercent.trim() === ""
        ? null
        : Number(parseFloat(discountPercent));
      const payload = {
        ...product,
        mainImage: doneImages[0].fileName,
        price: parsedPrice,
        salePrice: computeSalePrice(parsedPrice, discountNumber),
      };
      const response = await apiClient.put(`/api/products/${id}`, payload);

      if (response.status === 200) {
        const updatedProduct = await response.json();
        await syncGalleryImages(doneImages);
        setProduct(updatedProduct);
        setPriceInput(updatedProduct?.price?.toString() ?? "");
        setDiscountPercent(
          computeDiscountPercent(updatedProduct?.price, updatedProduct?.salePrice)?.toString() ?? ""
        );
        await fetch("/api/admin/revalidate-products", { method: "POST" }).catch(
          () => undefined
        );
        toast.success("Product successfully updated");
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "There was an error while updating product"
        );
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("There was an error while updating product");
    }
  };

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

  // refresh the gallery image list for this product
  const refreshGalleryImages = useCallback(async () => {
    const imagesData = await apiClient.get(`/api/images/${id}`, {
      cache: "no-store",
    });
    const images = await imagesData.json();
    setOtherImages(Array.isArray(images) ? images : []);
  }, [id]);

  useEffect(() => {
    if (imagesInitialized || !product?.mainImage) return;

    setProductImages([
      {
        localId: "main",
        fileName: product.mainImage,
        previewUrl: `/${product.mainImage}`,
        status: "done",
      },
      ...otherImages.map((img) => ({
        localId: img.imageID,
        fileName: img.image,
        previewUrl: `/${img.image}`,
        status: "done" as const,
      })),
    ]);
    setImagesInitialized(true);
  }, [product?.mainImage, otherImages, imagesInitialized]);

  const fetchProductData = useCallback(async () => {
    apiClient
      .get(`/api/products/${id}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setPriceInput(data?.price?.toString() ?? "");
        setDiscountPercent(
          computeDiscountPercent(data?.price, data?.salePrice)?.toString() ?? ""
        );
      });

    await refreshGalleryImages();
  }, [id, refreshGalleryImages]);

  // fetching all product categories. It will be used for displaying categories in select category input
  const fetchCategories = useCallback(async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [fetchCategories, fetchProductData]);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 w-full max-xl:px-5">
        <h1 className="text-3xl font-semibold">Product details</h1>
        {/* Product name input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title || ""}
              onChange={(e) =>
                setProduct({ ...product!, title: e.target.value })
              }
            />
          </label>
        </div>
        {/* Product name input div - end */}
        {/* Product price input div - start */}

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
              value={priceInput}
              onChange={(e) => {
                const nextValue = e.target.value;
                if (/^[\d,\s.PKRpkr]*$/.test(nextValue)) {
                  setPriceInput(nextValue);
                  const parsedPriceValue = parsePriceInput(nextValue);
                  const discountNumber = discountPercent.trim() === "" ? null : Number(parseFloat(discountPercent));
                  setProduct({
                    ...product!,
                    price: parsedPriceValue ?? 0,
                    salePrice: computeSalePrice(parsedPriceValue, discountNumber),
                  });
                }
              }}
            />
          </label>
        </div>
        {/* Product price input div - end */}
        {/* Product discount input div - start */}
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
              value={discountPercent}
              onChange={(e) => {
                const nextValue = e.target.value;
                setDiscountPercent(nextValue);
                const discountNumber = nextValue.trim() === "" ? null : Number(parseFloat(nextValue));
                const parsedPriceValue = parsePriceInput(priceInput);
                setProduct({
                  ...product!,
                  salePrice: computeSalePrice(parsedPriceValue, discountNumber),
                });
              }}
            />
          </label>
          {discountPercent.trim() !== "" && (
            <p className="text-sm mt-1 text-emerald-600 dark-sale-text font-medium">
              Sale price (auto): PKR{" "}
              {product?.salePrice
                ? Number(product.salePrice).toLocaleString()
                : "—"}
            </p>
          )}
        </div>
        {/* Product discount input div - end */}
        {/* Product manufacturer input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              {/* Label changed from "Manufacturer" to "Brand" for clothing context */}
              <span className="label-text">Brand:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.manufacturer || ""}
              onChange={(e) =>
                setProduct({ ...product!, manufacturer: e.target.value })
              }
            />
          </label>
        </div>
        {/* Product manufacturer input div - end */}
        {/* Product slug input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={
                product?.slug ? convertSlugToURLFriendly(product?.slug) : ""
              }
              onChange={(e) =>
                setProduct({
                  ...product!,
                  slug: convertSlugToURLFriendly(e.target.value),
                })
              }
            />
          </label>
        </div>
        {/* Product slug input div - end */}
        {/* Product stock quantity input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Stock quantity:</span>
            </div>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full max-w-xs"
              value={product?.inStock ?? 0}
              onChange={(e) => {
                const nextValue = Math.max(0, Math.floor(Number(e.target.value) || 0));
                setProduct({ ...product!, inStock: nextValue });
              }}
            />
          </label>
        </div>
        {/* Product stock quantity input div - end */}

        {/* Sizes field — comma-separated values */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Sizes (comma-separated, e.g. S,M,L,XL):</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="S,M,L,XL,XXL"
              value={(product as any)?.sizes || ""}
              onChange={(e) =>
                setProduct({ ...product!, sizes: e.target.value } as any)
              }
            />
          </label>
        </div>

        {/* Colors field — comma-separated values */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Colors (comma-separated, e.g. Black,White,Red):</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="Black,White,Navy"
              value={product?.colors || ""}
              onChange={(e) =>
                setProduct({ ...product!, colors: e.target.value })
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
              value={product?.fabric || ""}
              onChange={(e) =>
                setProduct({ ...product!, fabric: e.target.value })
              }
            />
          </label>
        </div>

        {/* Product category select input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId || ""}
              onChange={(e) =>
                setProduct({
                  ...product!,
                  categoryId: e.target.value,
                })
              }
            >
              {categories &&
                categories.map((category: Category) => (
                  <option key={category?.id} value={category?.id}>
                    {formatCategoryName(category?.name)}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {/* Product category select input div - end */}

        {/* Product images */}
        <ProductImageUpload
          images={productImages}
          onChange={setProductImages}
          onUploadFile={uploadFile}
        />

        {/* Product description div - start */}
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description || ""}
              onChange={(e) =>
                setProduct({ ...product!, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
        {/* Product description div - end */}
        {/* Action buttons div - start */}
        <div className="flex gap-x-2 max-sm:flex-col">
          <button
            type="button"
            onClick={updateProduct}
            className="uppercase bg-stone-900 px-10 py-5 text-lg border border-gray-300 font-bold text-white shadow-sm hover:bg-stone-800 hover:text-white focus:outline-none focus:ring-2"
          >
            Update product
          </button>
          <button
            type="button"
            className="uppercase bg-red-600 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2"
            onClick={deleteProduct}
          >
            Delete product
          </button>
        </div>
        {/* Action buttons div - end */}
        <p className="text-xl max-sm:text-lg text-error">
          To delete the product you first need to delete all its records in
          orders (customer_order_product table).
        </p>
      </div>
    </div>
  );
};
