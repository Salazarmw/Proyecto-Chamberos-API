const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, JobController.getAllJobs);
router.get('/:id', authMiddleware, JobController.getJobById);
router.post('/', authMiddleware, JobController.createJob);
router.put('/:id', authMiddleware, JobController.updateJob);
router.post('/:id/approve', authMiddleware, JobController.approveJob);
router.delete('/:id', authMiddleware, JobController.deleteJob);

module.exports = router;