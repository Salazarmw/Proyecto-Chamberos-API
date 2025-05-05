const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  me,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback
} = require("../controllers/AuthController");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Social auth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/facebook", facebookAuth);
router.get("/facebook/callback", facebookCallback);

// Get current user route
router.get("/me", require("../middleware/authMiddleware"), me);

module.exports = router;
