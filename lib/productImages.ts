/** Shared product image rules — used by admin UI and mirrored on the server. */

export const MAX_PRODUCT_IMAGES = 4;
export const MAX_GALLERY_IMAGES = MAX_PRODUCT_IMAGES - 1; // main image counts as 1

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** 5 MB before client-side compression */
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

export type ProductImageStatus = "idle" | "uploading" | "done" | "failed";

export interface ProductImageItem {
  /** Local UI key */
  localId: string;
  /** Server path e.g. uploads/foo.jpg — empty while uploading */
  fileName: string;
  /** Blob preview URL */
  previewUrl: string;
  status: ProductImageStatus;
  error?: string;
}

export function isAllowedImageType(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return true;
  }
  const lower = file.name.toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function validateImageFile(file: File): string | null {
  if (!isAllowedImageType(file)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export function createLocalId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
