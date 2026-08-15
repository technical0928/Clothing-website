"use client";
import { CustomButton, DashboardSidebar, SectionTitle } from "@/components";
import Image from "next/image";
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

export default function DashboardProductDetails({ params }: any) {
  const id = params?.id;

  const [product, setProduct] = useState<Product>();
  const [priceInput, setPriceInput] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "done" | "failed"
  >("idle");
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

    // If the user picked a new image, it must have uploaded successfully
    // before we update — otherwise the product would have a broken image.
    if (uploadState === "uploading") {
      toast.error("Image is still uploading — please wait a moment");
      return;
    }
    if (uploadState === "failed") {
      toast.error("Image upload failed — please select the image again");
      return;
    }

    try {
      const discountNumber = discountPercent.trim() === ""
        ? null
        : Number(parseFloat(discountPercent));
      const payload = {
        ...product,
        price: parsedPrice,
        salePrice: computeSalePrice(parsedPrice, discountNumber),
      };
      const response = await apiClient.put(`/api/products/${id}`, payload);

      if (response.status === 200) {
        const updatedProduct = await response.json();
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

  // functionality for uploading main image file
  const uploadFile = async (file: any): Promise<string> => {
    setUploadState("uploading");

    // Compress large phone photos so the upload always succeeds quickly.
    let payload: any = file;
    try {
      payload = await compressImage(file);
    } catch (error) {
      console.error("[uploadFile] compression failed, sending original:", error);
    }

    const formData = new FormData();
    formData.append("uploadedFile", payload);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/main-image`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Main image uploaded:", data);
        // Server sanitizes the filename — use the returned name
        if (data?.fileName) {
          setUploadState("done");
          return data.fileName;
        }
      } else {
        toast.error("File upload unsuccessful.");
      }
    } catch (error) {
      console.error("There was an error while during request sending:", error);
      toast.error("There was an error during request sending");
    }

    setUploadState("failed");
    // IMPORTANT: never fall back to the local file name — a raw filename
    // can't be served by the API and would show as a broken image forever.
    return "";
  };

  // refresh the gallery image list for this product
  const refreshGalleryImages = useCallback(async () => {
    const imagesData = await apiClient.get(`/api/images/${id}`, {
      cache: "no-store",
    });
    const images = await imagesData.json();
    setOtherImages(Array.isArray(images) ? images : []);
  }, [id]);

  // functionality for uploading a gallery image (file upload + DB record)
  const uploadGalleryImage = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    setGalleryUploading(true);
    try {
      const uploadResponse = await fetch(`${config.apiBaseUrl}/api/main-image`, {
        method: "POST",
        body: formData,
      });
      if (!uploadResponse.ok) {
        toast.error("File upload unsuccessful.");
        return;
      }

      const uploadData = await uploadResponse.json();
      // Server sanitizes the filename — use the returned name for the DB record
      const savedName = uploadData?.fileName || file.name;

      const createResponse = await apiClient.post("/api/images", {
        productID: id,
        image: savedName,
      });
      if (!createResponse.ok) {
        toast.error("Failed to add image to gallery");
        return;
      }

      await refreshGalleryImages();
      await fetch("/api/admin/revalidate-products", { method: "POST" }).catch(
        () => undefined
      );
      toast.success("Gallery image added");
    } catch (error) {
      console.error("Error uploading gallery image:", error);
      toast.error("There was an error during request sending");
    } finally {
      setGalleryUploading(false);
    }
  };

  // functionality for deleting a single gallery image
  const deleteGalleryImage = async (imageID: string) => {
    try {
      const response = await apiClient.delete(`/api/images/${imageID}`);
      if (response.status !== 204) {
        toast.error("Failed to delete image");
        return;
      }
      await refreshGalleryImages();
      await fetch("/api/admin/revalidate-products", { method: "POST" }).catch(
        () => undefined
      );
      toast.success("Gallery image removed");
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      toast.error("There was an error while deleting image");
    }
  };

  // fetching main product data including other product images
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
            <p className="text-sm mt-1 text-emerald-600 font-medium">
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

        {/* Main image file upload div - start */}
        <div>
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            onChange={(e) => {
              // @ts-ignore
              const selectedFile = e.target.files[0];

              if (selectedFile) {
                uploadFile(selectedFile).then((savedName) => {
                  setProduct((current) => ({
                    ...current!,
                    mainImage: savedName,
                  }));
                });
              }
            }}
          />
          {uploadState === "uploading" && (
            <p className="text-sm mt-2 text-stone-500">
              Uploading image…
            </p>
          )}
          {uploadState === "failed" && (
            <p className="text-sm mt-2 text-red-600 font-medium">
              Image upload failed — please select the image again.
            </p>
          )}
          {product?.mainImage && (
            <Image
              src={`/` + product?.mainImage}
              alt={product?.title}
              className="w-auto h-auto mt-2"
              width={100}
              height={100}
            />
          )}
        </div>
        {/* Main image file upload div - end */}
        {/* Other images file upload div - start */}
        <div>
          <label className="form-control w-full max-w-sm">
            <div className="label">
              <span className="label-text">Gallery images (shown on the product page):</span>
            </div>
            <input
              type="file"
              accept="image/*"
              disabled={galleryUploading}
              className="file-input file-input-bordered file-input-md w-full max-w-sm disabled:cursor-not-allowed"
              onChange={(e: any) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  uploadGalleryImage(selectedFile);
                }
                e.target.value = "";
              }}
            />
          </label>
          {otherImages && otherImages.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {otherImages.map((image) => (
                <div
                  key={image.imageID}
                  className="group relative overflow-hidden rounded-md border border-stone-200 bg-stone-50"
                >
                  <Image
                    src={`/${image.image}`}
                    alt="product gallery image"
                    width={100}
                    height={100}
                    className="w-auto h-auto"
                  />
                  <button
                    type="button"
                    aria-label="Remove gallery image"
                    onClick={() => deleteGalleryImage(image.imageID)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-stone-500">
              No gallery images yet. Upload images above to show them on the product page.
            </p>
          )}
        </div>
        {/* Other images file upload div - end */}
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
