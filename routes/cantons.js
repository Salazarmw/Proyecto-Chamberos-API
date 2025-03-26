const express = require('express');
const router = express.Router();
const Canton = require('../models/Canton');

// Obtener cantones por ID de provincia
router.get('/:provinceId', async (req, res) => {
  try {
    console.log("Fetching cantons for provinceId:", req.params.provinceId); // Log para depurar
    const cantons = await Canton.find({ province_id: req.params.provinceId });
    console.log("Cantons found:", cantons); // Log para depurar
    res.status(200).json(cantons);
  } catch (error) {
    console.error("Error fetching cantons:", error);
    res.status(500).json({ error: 'Error fetching cantons' });
  }
});

module.exports = router;