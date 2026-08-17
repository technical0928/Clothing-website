const express = require("express");

const router = express.Router();
const { subscribe } = require("../controllers/newsletter");

router.route("/").post(subscribe);

module.exports = router;
