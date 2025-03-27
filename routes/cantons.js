const express = require("express");
const router = express.Router();
const Canton = require("../models/Canton");

router.get("/province/:provinceId", async (req, res) => {
  try {
    const cantons = await Canton.find({ province_id: req.params.provinceId });
    res.status(200).json(cantons);
  } catch (error) {
    console.error("Error fetching cantons:", error);
    res.status(500).json({ error: "Error fetching cantons" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const canton = await Canton.findById(req.params.id).populate(
      "province_id",
      "name"
    );
    if (!canton) {
      return res.status(404).json({ error: "Canton not found" });
    }
    res.status(200).json(canton);
  } catch (error) {
    console.error("Error fetching canton:", error);
    res.status(500).json({ error: "Error fetching canton" });
  }
});

module.exports = router;
