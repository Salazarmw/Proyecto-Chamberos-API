const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

// Rutas básicas de usuarios
router.get("/", userController.getAllUsers);
router.get("/current", auth, userController.getCurrentUser);
router.get("/:id", userController.getUserById);
router.get("/slug/:slug", userController.getUserBySlug);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Rutas para el usuario actual
router.put("/current", auth, userController.updateCurrentUser);
router.put("/current/password", auth, userController.updatePassword);
router.put("/current/photo", auth, upload.single("photo"), userController.updateProfilePhoto);

// Rutas para la galería de trabajos
router.post("/gallery", auth, upload.single("photo"), userController.addWorkPhoto);
router.delete("/gallery/:photoId", auth, userController.deleteWorkPhoto);
router.get("/gallery/:userId", userController.getWorkGallery);

module.exports = router; 