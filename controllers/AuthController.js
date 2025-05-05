const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { sendVerificationEmail } = require("../utils/emailSender");
const crypto = require("crypto");

// User registration
const register = async (req, res) => {
  let newUser = null;
  let session = null;

  try {
    // Iniciar una sesión de MongoDB para transacciones
    session = await mongoose.startSession();
    session.startTransaction();

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    newUser = new User({
      name: req.body.name,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
      user_type: req.body.user_type,
      phone: req.body.phone,
      province: req.body.province,
      canton: req.body.canton,
      address: req.body.address,
      birth_date: req.body.birth_date,
      tags: req.body.tags,
      verificationToken,
      verificationTokenExpires,
    });

    await newUser.save({ session });

    // Send verification email
    try {
      const emailSent = await sendVerificationEmail(
        newUser.email,
        verificationToken
      );

      if (!emailSent) {
        throw new Error("Failed to send verification email");
      }

      // Si todo sale bien, confirmar la transacción
      await session.commitTransaction();

      res.status(201).json({
        message:
          "Registration successful. Please check your email for verification.",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          user_type: newUser.user_type,
        },
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);

      // Si falla el envío del correo, abortar la transacción
      await session.abortTransaction();

      // Intentar eliminar el usuario manualmente por si la transacción falla
      if (newUser) {
        try {
          await User.findByIdAndDelete(newUser._id);
        } catch (deleteError) {
          console.error("Error deleting user after failed email:", deleteError);
        }
      }

      return res.status(500).json({
        message: "Error sending verification email",
        error: emailError.message,
      });
    }
  } catch (error) {
    // Si hay algún error durante el proceso, abortar la transacción
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Error aborting transaction:", abortError);
      }
    }

    // Intentar eliminar el usuario manualmente por si la transacción falla
    if (newUser) {
      try {
        await User.findByIdAndDelete(newUser._id);
      } catch (deleteError) {
        console.error(
          "Error deleting user after failed registration:",
          deleteError
        );
      }
    }

    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  } finally {
    // Cerrar la sesión si existe
    if (session) {
      session.endSession();
    }
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        isVerified: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        user_type: user.user_type,
        phone: user.phone,
        province: user.province,
        canton: user.canton,
        address: user.address,
        birth_date: user.birth_date,
        tags: user.tags,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying email", error: error.message });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    const emailSent = await sendVerificationEmail(
      user.email,
      verificationToken
    );
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Error sending verification email" });
    }

    res.json({ message: "Verification email resent successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error resending verification email",
      error: error.message,
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  me,
};
