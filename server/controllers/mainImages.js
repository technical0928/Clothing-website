const { PrismaClient } = require("@prisma/client");
const prisma = require("../utills/db"); // ✅ Use shared connection
const fs = require('fs');
const path = require('path');

// Uploads live in public/uploads/ and are served by the API at /uploads/*
// (Next.js production only serves files that existed at build time).
const UPLOADS_DIR = path.join(__dirname, "..", "..", "public", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

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

    // Using mv method for moving file to the directory on the server
    uploadedFile.mv(path.join(UPLOADS_DIR, finalFileName), (err) => {
      if (err) {
        return res.status(500).send(err);
      }
  
      res.status(200).json({
        message: "Fajl je uspešno otpremljen",
        fileName: relativePath
      });
    });
  }

  module.exports = {
    uploadMainImage
};