const User = require('../models/User');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

// Configurar S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ user_type: "chambero" }).populate('tags');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('tags');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, user_type, profile_photo, birth_date, address, province, canton, tags } = req.body;

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

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password, user_type, profile_photo, birth_date, address, province, canton, tags } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; //Should hash the password in the future
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

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('tags');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCurrentUser = async (req, res) => {
  try {
    console.log("Datos recibidos para actualizar:", req.body);
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Actualizar campos permitidos
    const allowedFields = [
      'name', 'lastname', 'email', 'phone', 'province', 
      'canton', 'address', 'birth_date', 'profile_photo', 'tags'
    ];

    // Excluir user_type y password de la actualización
    const updateData = { ...req.body };
    delete updateData.user_type;
    delete updateData.password;

    // Ensure tags are valid IDs
    if (updateData.tags) {
      updateData.tags = updateData.tags.filter(tagId => mongoose.Types.ObjectId.isValid(tagId));
    }

    // Update user with new data
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        user[key] = updateData[key];
      }
    });

    const updatedUser = await user.save();

    // Get updated user with populated tags and without password
    const populatedUser = await User.findById(updatedUser._id)
      .populate('tags')
      .select('-password');
    
    console.log("Usuario actualizado:", populatedUser);
    
    res.json(populatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(400).json({ 
      message: 'Error updating user',
      errors: err.errors || err.message 
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { current_password, password, password_confirmation } = req.body;
    
    // Validar que todos los campos estén presentes
    if (!current_password || !password || !password_confirmation) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos',
        errors: {
          current_password: !current_password ? 'La contraseña actual es requerida' : null,
          password: !password ? 'La nueva contraseña es requerida' : null,
          password_confirmation: !password_confirmation ? 'La confirmación de contraseña es requerida' : null
        }
      });
    }

    // Validar que las contraseñas coincidan
    if (password !== password_confirmation) {
      return res.status(400).json({
        message: 'Las contraseñas no coinciden',
        errors: {
          password_confirmation: 'Las contraseñas no coinciden'
        }
      });
    }

    // Obtener el usuario
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña actual
    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Contraseña actual incorrecta',
        errors: {
          current_password: 'La contraseña actual es incorrecta'
        }
      });
    }

    // Actualizar la contraseña
    user.password = password;
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(400).json({
      message: 'Error al actualizar la contraseña',
      errors: err.errors || err.message
    });
  }
};

exports.updateProfilePhoto = async (req, res) => {
  try {
    console.log('Received file:', req.file);
    console.log('Request body:', req.body);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Subir la imagen a S3
    const params = {
      Bucket: 'chambero-profile-bucket',
      Key: `profile-photos/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const { Location } = await s3.upload(params).promise();

    // Actualizar el usuario con la nueva URL de la foto
    user.profile_photo = Location;
    const updatedUser = await user.save();

    // Obtener los datos del usuario sin la contraseña y con los tags poblados
    const userResponse = await User.findById(updatedUser._id)
      .select('-password')
      .populate('tags');

    console.log('Updated user:', userResponse);
    res.json(userResponse);

  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ message: 'Error updating profile photo', error: error.message });
  }
};