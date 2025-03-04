const express = require('express');
const router = express.Router();
const QuotationController = require('../controllers/QuotationController');

router.get('/', QuotationController.getAllQuotations);
router.get('/:id', QuotationController.getQuotationById);
router.post('/', QuotationController.createQuotation);
router.put('/:id', QuotationController.updateQuotation);
router.delete('/:id', QuotationController.deleteQuotation);

module.exports = router;