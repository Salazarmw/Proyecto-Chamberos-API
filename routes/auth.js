const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController'); // Make sure this path is correct

// Register route
router.post('/register', AuthController.register); // Verify that 'register' is defined in AuthController

// Login route
router.post('/login', AuthController.login); // Verify that 'login' is defined in AuthController

// Get current user route
router.get('/me', require('../middleware/authMiddleware'), AuthController.me); // Verify that 'me' is defined in AuthController

module.exports = router;