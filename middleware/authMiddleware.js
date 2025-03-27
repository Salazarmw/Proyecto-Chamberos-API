const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No hay token de autenticación" });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "defaultSecretKeyForDevelopment"
      );
    } catch (error) {
      console.log("Invalid token:", error.message);
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found for token");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      user_type: user.user_type,
    };

    console.log("User authenticated:", req.user.id);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(500)
      .json({ message: "Error en la autenticación", error: error.message });
  }
};

module.exports = authMiddleware;
