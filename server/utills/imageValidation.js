const MAX_PRODUCT_IMAGES = 4;
const MAX_GALLERY_IMAGES = MAX_PRODUCT_IMAGES - 1;
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function isAllowedImage(uploadedFile) {
  const mime = (uploadedFile.mimetype || "").toLowerCase();
  if (ALLOWED_MIME_TYPES.has(mime)) return true;
  const name = String(uploadedFile.name || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function validateUploadedFile(uploadedFile) {
  if (!uploadedFile) {
    return "No file uploaded";
  }
  if (!isAllowedImage(uploadedFile)) {
    return "Only JPG, PNG, and WEBP images are allowed";
  }
  const size = uploadedFile.size || uploadedFile.data?.length || 0;
  if (size > MAX_IMAGE_FILE_SIZE) {
    return "Image must be 5 MB or smaller";
  }
  return null;
}

module.exports = {
  MAX_PRODUCT_IMAGES,
  MAX_GALLERY_IMAGES,
  validateUploadedFile,
};
