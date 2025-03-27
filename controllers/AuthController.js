const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// User registration
exports.register = async (req, res) => {
  try {
    console.log("Register request body:", req.body);

    const { name, lastname, email, password, user_type } = req.body;

    if (!name || !email || !password || !user_type) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
        errors: {
          name: !name ? "El nombre es requerido" : null,
          email: !email ? "El email es requerido" : null,
          password: !password ? "La contraseña es requerida" : null,
          user_type: !user_type ? "El tipo de usuario es requerido" : null,
        },
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "El correo electrónico ya está registrado",
        errors: {
          email: "El correo electrónico ya está registrado",
        },
      });
    }

    if (!["client", "chambero"].includes(user_type)) {
      return res.status(400).json({
        message: "Tipo de usuario inválido",
        errors: {
          user_type: 'El tipo de usuario debe ser "client" o "chambero"',
        },
      });
    }

    if (
      user_type === "chambero" &&
      (!req.body.tags ||
        !Array.isArray(req.body.tags) ||
        req.body.tags.length === 0)
    ) {
      return res.status(400).json({
        message: "Debe seleccionar al menos una categoría de servicio",
        errors: {
          tags: "Debe seleccionar al menos una categoría de servicio",
        },
      });
    }

    const userData = {
      name: req.body.name,
      lastname: req.body.lastname || "",
      email: req.body.email,
      password: await bcrypt.hash(password, 10),
      user_type: req.body.user_type,
      profile_photo: req.body.profile_photo || null,
      birth_date: req.body.birth_date || null,
      address: req.body.address || null,
      province: req.body.province || null,
      canton: req.body.canton || null,
      phone: req.body.phone || "",
    };

    if (user_type === "chambero" && req.body.tags) {
      const validTags = req.body.tags.filter((tagId) =>
        mongoose.Types.ObjectId.isValid(tagId)
      );
      userData.tags = validTags;
    }

    console.log("Creating user with data:", userData);

    const user = new User(userData);
    const newUser = await user.save();

    console.log("User created successfully:", newUser._id);

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        user_type: newUser.user_type,
      },
      process.env.JWT_SECRET || "defaultSecretKeyForDevelopment",
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        _id: newUser._id,
        name: newUser.name,
        lastname: newUser.lastname,
        email: newUser.email,
        user_type: newUser.user_type,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);

    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        message: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      message: "Error en el registro de usuario",
      error: error.message,
    });
  }
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "El correo y la contraseña son requeridos",
        errors: {
          email: !email ? "El correo es requerido" : null,
          password: !password ? "La contraseña es requerida" : null,
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET || "defaultSecretKeyForDevelopment",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      user: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        user_type: user.user_type,
      },
      token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({
      message: "Error en el inicio de sesión",
      error: err.message,
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("tags", "name description");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({
      message: "Error interno del servidor",
      error: err.message,
    });
  }
};
