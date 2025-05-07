const User = require("../models/User");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");

// Configurar S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Definir todas las funciones del controlador
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ user_type: "chambero" }).populate("tags");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("tags");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    user_type,
    profile_photo,
    birth_date,
    address,
    province,
    canton,
    tags,
  } = req.body;

  const user = new User({
    name,
    email,
    password,
    user_type,
    profile_photo,
    birth_date,
    address,
    province,
    canton,
    tags,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      name,
      email,
      password,
      user_type,
      profile_photo,
      birth_date,
      address,
      province,
      canton,
      tags,
    } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (user_type) user.user_type = user_type;
    if (profile_photo) user.profile_photo = profile_photo;
    if (birth_date) user.birth_date = birth_date;
    if (address) user.address = address;
    if (province) user.province = province;
    if (canton) user.canton = canton;
    if (tags) user.tags = tags;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If you are a social user, no password is required
    if (user.socialProvider) {
      await User.findByIdAndDelete(req.params.id);
      return res.json({ message: "User deleted successfully" });
    }

    // For traditional users, require password
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to delete account" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("tags");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    console.log("Datos recibidos para actualizar:", req.body);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedFields = [
      "name",
      "lastname",
      "email",
      "phone",
      "province",
      "canton",
      "address",
      "birth_date",
      "profile_photo",
      "tags",
    ];

    const updateData = { ...req.body };
    delete updateData.user_type;
    delete updateData.password;

    if (updateData.tags) {
      updateData.tags = updateData.tags.filter((tagId) =>
        mongoose.Types.ObjectId.isValid(tagId)
      );
    }

    // Update user with new data
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        user[key] = updateData[key];
      }
    });

    // Check if the profile is complete (all required fields except profile_photo)
    const requiredFields = [
      "name",
      "lastname",
      "email",
      "phone",
      "province",
      "canton",
      "address",
      "birth_date",
      "tags",
    ];
    const isComplete = requiredFields.every((field) => {
      if (Array.isArray(user[field])) {
        return user[field] && user[field].length > 0;
      }
      return (
        user[field] !== undefined && user[field] !== null && user[field] !== ""
      );
    });
    user.isProfileComplete = isComplete;

    const updatedUser = await user.save();
    const populatedUser = await User.findById(updatedUser._id)
      .populate("tags")
      .select("-password");

    console.log("Usuario actualizado:", populatedUser);

    res.json(populatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).json({
      message: "Error updating user",
      errors: err.errors || err.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { current_password, password, password_confirmation } = req.body;

    // Validar que todos los campos estén presentes
    if (!current_password || !password || !password_confirmation) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
        errors: {
          current_password: !current_password
            ? "La contraseña actual es requerida"
            : null,
          password: !password ? "La nueva contraseña es requerida" : null,
          password_confirmation: !password_confirmation
            ? "La confirmación de contraseña es requerida"
            : null,
        },
      });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({
        message: "Las contraseñas no coinciden",
        errors: {
          password_confirmation: "Las contraseñas no coinciden",
        },
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Contraseña actual incorrecta",
        errors: {
          current_password: "La contraseña actual es incorrecta",
        },
      });
    }

    user.password = password;
    await user.save();

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(400).json({
      message: "Error al actualizar la contraseña",
      errors: err.errors || err.message,
    });
  }
};

const updateProfilePhoto = async (req, res) => {
  try {
    console.log("Received file:", req.file);
    console.log("Request body:", req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const params = {
      Bucket: "chambero-profile-bucket",
      Key: `profile-photos/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const { Location } = await s3.upload(params).promise();

    user.profile_photo = Location;
    const updatedUser = await user.save();

    const userResponse = await User.findById(updatedUser._id)
      .select("-password")
      .populate("tags");

    console.log("Updated user:", userResponse);
    res.json(userResponse);
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res
      .status(500)
      .json({ message: "Error updating profile photo", error: error.message });
  }
};

const getUserBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    if (!slug) return res.status(400).json({ message: 'Slug is required' });

    const [namePart, ...lastnameParts] = slug.split('-');
    if (!namePart || lastnameParts.length === 0) {
      return res.status(400).json({ message: "Invalid slug format" });
    }
    const name = namePart.replace(/\b\w/g, (l) => l.toUpperCase());
    const lastname = lastnameParts
      .join(" ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const user = await User.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      lastname: { $regex: `^${lastname}$`, $options: "i" },
    }).populate("tags");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addWorkPhoto = async (req, res) => {
  try {
    const { description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No se ha proporcionado ninguna imagen" });
    }

    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `work-gallery/${req.user._id}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    const uploadResult = await s3.upload(s3Params).promise();

    const user = await User.findById(req.user._id);
    user.work_gallery.push({
      image_url: uploadResult.Location,
      description: description || "",
    });
    await user.save();

    res.status(200).json({
      message: "Foto agregada exitosamente",
      photo: user.work_gallery[user.work_gallery.length - 1],
    });
  } catch (error) {
    console.error("Error al agregar foto:", error);
    res.status(500).json({ message: "Error al agregar la foto" });
  }
};

const deleteWorkPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const user = await User.findById(req.user._id);

    const photo = user.work_gallery.id(photoId);
    if (!photo) {
      return res.status(404).json({ message: "Foto no encontrada" });
    }

    const key = photo.image_url.split("/").slice(-2).join("/");

    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    }).promise();

    user.work_gallery = user.work_gallery.filter(
      (p) => p._id.toString() !== photoId
    );
    await user.save();

    res.status(200).json({ message: "Foto eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    res.status(500).json({ message: "Error al eliminar la foto" });
  }
};

const getWorkGallery = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("work_gallery");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ gallery: user.work_gallery });
  } catch (error) {
    console.error("Error al obtener galería:", error);
    res.status(500).json({ message: "Error al obtener la galería" });
  }
};

// Exportar todas las funciones
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  updatePassword,
  updateProfilePhoto,
  getUserBySlug,
  addWorkPhoto,
  deleteWorkPhoto,
  getWorkGallery,
};
