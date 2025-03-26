const express = require('express');
const router = express.Router();
const Canton = require('../models/Canton');

// Obtener cantones por ID de provincia
router.get('/:provinceId', async (req, res) => {
  try {
    const cantons = await Canton.find({ province_id: req.params.provinceId });
    res.status(200).json(cantons);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cantons' });
  }
});

module.exports = router;