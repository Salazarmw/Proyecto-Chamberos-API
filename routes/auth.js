const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController'); // Asegúrate de que esta ruta sea correcta

// Route for user registration
router.post('/register', AuthController.register); // Verifica que `register` esté definido en AuthController

// Route for user login
router.post('/login', AuthController.login); // Verifica que `login` esté definido en AuthController

// Route for fetching authenticated user data
router.get('/me', require('../middleware/authMiddleware'), AuthController.me); // Verifica que `me` esté definido en AuthController

module.exports = router;