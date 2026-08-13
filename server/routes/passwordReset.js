const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  verifyOtp,
  resetPassword,
  getResetStatus,
} = require("../controllers/passwordReset");

router.post("/forgot", requestPasswordReset);
router.post("/verify", verifyOtp);
router.post("/reset", resetPassword);
router.get("/status", getResetStatus);

module.exports = router;
