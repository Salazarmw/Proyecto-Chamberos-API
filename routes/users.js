const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const galleryController = require("../controllers/galleryController");

router.get('/me', authMiddleware, UserController.getCurrentUser);
router.put('/me', authMiddleware, UserController.updateCurrentUser);
router.put('/me/password', authMiddleware, UserController.updatePassword);
router.post('/me/profile-photo', authMiddleware, upload.single('profile_photo'), UserController.updateProfilePhoto);

router.get('/', UserController.getAllUsers);
router.get('/slug/:slug', UserController.getUserBySlug);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', authMiddleware, UserController.updateUser);
router.delete('/:id', authMiddleware, UserController.deleteUser);

// Rutas de la galería
router.get("/:userId/gallery", galleryController.getGallery);
router.post("/:userId/gallery", authMiddleware, galleryController.uploadImage);
router.delete("/:userId/gallery/:imageId", authMiddleware, galleryController.deleteImage);

module.exports = router;