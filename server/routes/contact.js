const express = require("express");
const {
  sendContactMessage,
  listContactMessages,
  updateContactMessage,
  deleteContactMessage,
} = require("../controllers/contact");

const router = express.Router();

// POST /api/contact — submit a message from the website contact page (public)
router.post("/", sendContactMessage);

// Admin endpoints for managing contact messages in the dashboard.
// The admin UI is protected by Next.js middleware (/admin/* requires role=admin).
router.get("/", listContactMessages);
router.patch("/:id", updateContactMessage);
router.delete("/:id", deleteContactMessage);

module.exports = router;
