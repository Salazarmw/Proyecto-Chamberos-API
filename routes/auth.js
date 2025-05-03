const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  me
} = require("../controllers/authController");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Get current user route
router.get("/me", require("../middleware/authMiddleware"), me);

module.exports = router;
