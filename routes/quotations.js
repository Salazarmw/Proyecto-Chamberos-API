const express = require('express');
const router = express.Router();
const QuotationController = require('../controllers/QuotationController');

// routes
router.get('/', QuotationController.getAllQuotations);
router.get('/:id', QuotationController.getQuotationById);
router.post('/', QuotationController.createQuotation);
router.put('/:id', QuotationController.updateQuotation);
router.delete('/:id', QuotationController.deleteQuotation);
router.put('/:id/status', QuotationController.updateQuotationStatus);

module.exports = router;