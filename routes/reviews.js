const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/user/:userId', ReviewController.getReviewsByUserId);
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReviewById);
router.post('/', authMiddleware, ReviewController.createReview);
router.put('/:id', ReviewController.updateReview);
router.delete('/:id', ReviewController.deleteReview);

module.exports = router;