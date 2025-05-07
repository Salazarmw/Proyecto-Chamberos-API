const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/galleryController");
const { isAuthenticated } = require("../middleware/auth");

// Obtener la galería de un usuario
router.get("/:userId/gallery", galleryController.getGallery);

// Subir una imagen a la galería (requiere autenticación)
router.post("/:userId/gallery", isAuthenticated, galleryController.uploadImage);

// Eliminar una imagen de la galería (requiere autenticación)
router.delete("/:userId/gallery/:imageId", isAuthenticated, galleryController.deleteImage);

module.exports = router; 