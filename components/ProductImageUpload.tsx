"use client";

import React, { useCallback, useRef, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import {
  MAX_PRODUCT_IMAGES,
  ProductImageItem,
  createLocalId,
  validateImageFile,
} from "@/lib/productImages";

interface ProductImageUploadProps {
  images: ProductImageItem[];
  onChange: React.Dispatch<React.SetStateAction<ProductImageItem[]>>;
  onUploadFile: (file: File) => Promise<string>;
  disabled?: boolean;
}

const ProductImageUpload = ({
  images,
  onChange,
  onUploadFile,
  disabled = false,
}: ProductImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const atMax = images.length >= MAX_PRODUCT_IMAGES;
  const isUploading = images.some((img) => img.status === "uploading");
  const canAddMore = !atMax && !disabled && !isUploading;

  const removeImage = useCallback(
    (localId: string) => {
      const target = images.find((img) => img.localId === localId);
      if (target?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      onChange(images.filter((img) => img.localId !== localId));
      setSelectionError(null);
    },
    [images, onChange]
  );

  const handleFilesSelected = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const incoming = Array.from(fileList);
      const remainingSlots = MAX_PRODUCT_IMAGES - images.length;

      if (remainingSlots <= 0) {
        setSelectionError(`Maximum ${MAX_PRODUCT_IMAGES} images reached.`);
        return;
      }

      if (incoming.length > remainingSlots) {
        setSelectionError(
          `You can only add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}. Maximum ${MAX_PRODUCT_IMAGES} images allowed.`
        );
        return;
      }

      const existingKeys = new Set<string>();

      const nextImages = [...images];
      const toUpload: { localId: string; file: File; previewUrl: string }[] = [];

      for (const file of incoming) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setSelectionError(validationError);
          return;
        }

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (existingKeys.has(fileKey)) {
          setSelectionError("Duplicate image selected.");
          return;
        }
        existingKeys.add(fileKey);

        const localId = createLocalId();
        const previewUrl = URL.createObjectURL(file);
        toUpload.push({ localId, file, previewUrl });
        nextImages.push({
          localId,
          fileName: "",
          previewUrl,
          status: "uploading",
        });
      }

      setSelectionError(null);
      onChange(nextImages);

      for (const item of toUpload) {
        try {
          const fileName = await onUploadFile(item.file);
          if (!fileName) {
            onChange((prev) =>
              prev.map((img) =>
                img.localId === item.localId
                  ? { ...img, status: "failed", error: "Upload failed" }
                  : img
              )
            );
            continue;
          }
          onChange((prev) =>
            prev.map((img) =>
              img.localId === item.localId
                ? { ...img, fileName, status: "done" }
                : img
            )
          );
        } catch {
          onChange((prev) =>
            prev.map((img) =>
              img.localId === item.localId
                ? { ...img, status: "failed", error: "Upload failed" }
                : img
            )
          );
        }
      }

      if (inputRef.current) inputRef.current.value = "";
    },
    [images, onChange, onUploadFile]
  );

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-5 theme-surface">
        <div className="text-center mb-4">
          <h3 className="text-base font-semibold theme-text-primary">
            Upload Product Images
          </h3>
          <p className="text-sm theme-text-secondary mt-1">
            Add up to {MAX_PRODUCT_IMAGES} product images. Image 1 is the primary
            photo.
          </p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {images.map((img, index) => (
              <div
                key={img.localId}
                className="relative rounded-lg border border-stone-200 bg-white overflow-hidden theme-card"
              >
                <div className="aspect-[3/4] relative bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                  {img.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40">
                      <span className="loading loading-spinner loading-sm text-white" />
                    </div>
                  )}
                  {img.status === "failed" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 px-2">
                      <span className="text-xs text-white text-center font-medium">
                        Failed
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5 text-xs font-medium theme-text-secondary text-center border-t border-stone-100">
                  Image {index + 1}
                  {index === 0 && (
                    <span className="block text-[10px] text-amber-600 font-normal">
                      Primary
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove image ${index + 1}`}
                  disabled={disabled || img.status === "uploading"}
                  onClick={() => removeImage(img.localId)}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/80 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <FiX className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}

        {canAddMore ? (
          <div className="flex flex-col items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={disabled}
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white px-5 py-3 text-sm font-medium theme-text-primary hover:border-amber-500 hover:text-amber-700 transition-colors theme-card"
            >
              <FiUpload className="text-base" />
              {images.length === 0 ? "Choose Images" : "Add More Images"}
            </button>
            <p className="text-xs theme-text-muted">JPG / PNG / WEBP · Max 5 MB each</p>
          </div>
        ) : atMax ? (
          <p className="text-center text-sm font-medium text-amber-700">
            Maximum {MAX_PRODUCT_IMAGES} images reached
          </p>
        ) : isUploading ? (
          <p className="text-center text-sm theme-text-secondary">Uploading…</p>
        ) : null}

        {selectionError && (
          <p className="mt-3 text-sm text-red-600 font-medium text-center">
            {selectionError}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductImageUpload;
