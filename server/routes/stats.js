const express = require("express");

const router = express.Router();

const { getDashboardStats } = require("../controllers/stats");

router.route("/").get(getDashboardStats);

module.exports = router;
