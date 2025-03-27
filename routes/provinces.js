const express = require("express");
const router = express.Router();
const {
  getProvinces,
  getProvinceById,
} = require("../controllers/ProvinceController");

router.get("/", getProvinces);
router.get("/:id", getProvinceById);

module.exports = router;
