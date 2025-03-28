const express = require('express');
const router = express.Router();
const QuotationController = require('../controllers/QuotationController');
const authMiddleware = require('../middleware/authMiddleware');

// routes
router.get('/', authMiddleware, QuotationController.getAllQuotations);
router.get('/:id', authMiddleware, QuotationController.getQuotationById);
router.post('/', authMiddleware, QuotationController.createQuotation);
router.put('/:id', authMiddleware, QuotationController.updateQuotation);
router.delete('/:id', authMiddleware, QuotationController.deleteQuotation);
router.put('/:id/status', authMiddleware, QuotationController.updateQuotationStatus);

module.exports = router;