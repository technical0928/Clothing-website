/**
 * Resize/compress an image client-side before upload.
 *
 * Phone photos are often 3-10MB — too big for reliable uploads to
 * serverless hosts (Vercel caps request bodies ~4.5MB and cold starts
 * are slow). Compressing to a reasonable size keeps uploads fast and
 * guarantees they succeed. Small files (< 1MB) pass through untouched.
 *
 * Returns the original File when compression isn't needed or fails.
 */
export async function compressImage(
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<File> {
  // Small files are fine as-is.
  if (file.size <= 1024 * 1024) return file;

  try {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to decode image"));
      image.src = dataUrl;
    });

    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    if (scale >= 1) return file; // Already small enough

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file;

    // Keep the original name so the server still sanitizes a familiar name.
    const name = file.name.replace(/\.[^.]+$/, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } catch (error) {
    console.error("[compressImage] compression skipped:", error);
    return file;
  }
}
