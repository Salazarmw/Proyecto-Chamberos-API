const express = require('express');
const router = express.Router();
const { getProvinces } = require('../controllers/ProvinceController');

router.get('/', getProvinces);

module.exports = router;