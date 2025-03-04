const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');

router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);
router.post('/', JobController.createJob);
router.put('/:id', JobController.updateJob);
router.delete('/:id', JobController.deleteJob);

module.exports = router;