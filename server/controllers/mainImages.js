const { PrismaClient } = require("@prisma/client");
const prisma = require("../utills/db"); // ✅ Use shared connection
const fs = require('fs');
const path = require('path');

// Uploads live in public/uploads/ locally. On Vercel the filesystem is
// read-only outside /tmp, so uploaded files are ALSO persisted in the Neon
// database (ProductImageFile) and served back from there — they never vanish.
const UPLOADS_DIR = process.env.VERCEL
  ? path.join(require("os").tmpdir(), "uploads")
  : path.join(__dirname, "..", "..", "public", "uploads");
try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (error) {
  console.error("[mainImages] Could not create uploads dir:", error.message);
}

/**
 * Make an uploaded filename safe for the web server.
 * Names like "ChatGPT Image Apr 28, 2026, 12_44_24 PM.png" contain
 * spaces/commas/colons which Next.js production static serving cannot
 * resolve (404). Replace every unsafe character with a dash and ensure
 * the result has a unique suffix so two files never overwrite each other.
 */
const sanitizeFileName = (originalName) => {
  const base = String(originalName || "file");
  const dotIndex = base.lastIndexOf(".");
  const extension = dotIndex > -1 ? base.slice(dotIndex) : "";
  const namePart = dotIndex > -1 ? base.slice(0, dotIndex) : base;
  const safeBase = namePart
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "image";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${safeBase}-${unique}${extension.toLowerCase()}`;
};

async function uploadMainImage(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "Nema otpremljenih fajlova" });
    }
  
    // Get file from a request
    const uploadedFile = req.files.uploadedFile;

    // Save under a safe, unique filename in the uploads directory
    const finalFileName = sanitizeFileName(uploadedFile.name);
    const relativePath = `uploads/${finalFileName}`;

    // Persist the bytes in Neon so they survive serverless restarts.
    try {
      await prisma.productImageFile.upsert({
        where: { fileName: relativePath },
        update: {
          data: uploadedFile.data,
          mimeType: uploadedFile.mimetype || "application/octet-stream",
          size: uploadedFile.size || uploadedFile.data.length,
        },
        create: {
          fileName: relativePath,
          data: uploadedFile.data,
          mimeType: uploadedFile.mimetype || "application/octet-stream",
          size: uploadedFile.size || uploadedFile.data.length,
        },
      });
    } catch (error) {
      console.error("[mainImages] Failed to persist image in DB:", error.message);
      return res.status(500).send(error);
    }

    // Also write to local disk where possible (dev mode / persistent hosts).
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, finalFileName), uploadedFile.data);
    } catch (error) {
      console.warn("[mainImages] Disk write skipped:", error.message);
    }

    res.status(200).json({
      message: "Fajl je uspešno otpremljen",
      fileName: relativePath,
    });
  }

  module.exports = {
    uploadMainImage
};