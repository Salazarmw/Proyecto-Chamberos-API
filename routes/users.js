const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, UserController.getCurrentUser);
router.put('/me', authMiddleware, UserController.updateCurrentUser);
router.put('/me/password', authMiddleware, UserController.updatePassword);

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', authMiddleware, UserController.updateUser);
router.delete('/:id', authMiddleware, UserController.deleteUser);

module.exports = router;