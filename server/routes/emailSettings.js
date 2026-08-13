const express = require("express");
const router = express.Router();
const {
  getEmailSettings,
  saveEmailSettings,
  testEmail,
} = require("../controllers/emailSettings");

router.route("/email").get(getEmailSettings).post(saveEmailSettings);
router.post("/email/test", testEmail);

module.exports = router;
