const User = require("../models/User");
const multer = require("multer");
const { uploadToS3, deleteFromS3 } = require("../config/s3");

// Configuración de multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)"));
    }
  },
}).single("image");

// Obtener la galería de un usuario
exports.getGallery = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ gallery: user.work_gallery || [] });
  } catch (error) {
    console.error("Error getting gallery:", error);
    res.status(500).json({ message: "Error al obtener la galería" });
  }
};

// Subir una imagen a la galería
exports.uploadImage = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No se ha proporcionado ninguna imagen" });
    }

    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Verificar que el usuario autenticado es el propietario
      if (req.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "No autorizado" });
      }

      // Subir imagen a S3
      const imageUrl = await uploadToS3(req.file, 'works-gallery');

      const newImage = {
        image_url: imageUrl,
        description: req.body.description || "",
        uploaded_at: new Date(),
      };

      user.work_gallery.push(newImage);
      await user.save();

      res.status(201).json({ message: "Imagen subida exitosamente", image: newImage });
    } catch (error) {
      console.error("Error uploading image:", error);
      
      // Manejar errores específicos de S3
      if (error.code === 'AccessDenied') {
        return res.status(403).json({ 
          message: "No tienes permisos para subir imágenes",
          error: error.message,
          details: error
        });
      }
      
      res.status(500).json({ 
        message: "Error al subir la imagen",
        error: error.message,
        details: error
      });
    }
  });
};

// Eliminar una imagen de la galería
exports.deleteImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el usuario autenticado es el propietario
    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const imageIndex = user.work_gallery.findIndex(
      (img) => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    const imageUrl = user.work_gallery[imageIndex].image_url;
    if (!imageUrl) {
      return res.status(400).json({ message: "URL de imagen no válida" });
    }

    console.log("Detalles de la imagen a eliminar:", {
      url: imageUrl,
      userId: req.user._id,
      imageId: req.params.imageId,
      imageData: user.work_gallery[imageIndex]
    });

    try {
      // Eliminar la imagen de S3
      await deleteFromS3(imageUrl);

      // Eliminar la referencia de la base de datos
      user.work_gallery.splice(imageIndex, 1);
      await user.save();

      res.json({ message: "Imagen eliminada exitosamente" });
    } catch (s3Error) {
      console.error("Error detallado de S3:", {
        error: s3Error,
        code: s3Error.code,
        message: s3Error.message,
        requestId: s3Error.requestId,
        cfId: s3Error.cfId,
        statusCode: s3Error.statusCode,
        stack: s3Error.stack
      });
      
      // Si el error es que el objeto no existe en S3, aún así eliminamos la referencia de la BD
      if (s3Error.code === 'NoSuchKey') {
        user.work_gallery.splice(imageIndex, 1);
        await user.save();
        return res.json({ 
          message: "Imagen eliminada de la base de datos (no encontrada en S3)",
          warning: "La imagen no se encontró en el almacenamiento"
        });
      }

      // Manejar errores específicos de S3
      if (s3Error.code === 'AccessDenied') {
        return res.status(403).json({ 
          message: "No tienes permisos para eliminar imágenes",
          error: s3Error.message,
          details: {
            code: s3Error.code,
            requestId: s3Error.requestId,
            statusCode: s3Error.statusCode,
            url: imageUrl
          }
        });
      }

      throw s3Error; // Re-lanzar otros errores para el manejo general
    }
  } catch (error) {
    console.error("Error general:", {
      error,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Error al eliminar la imagen",
      error: error.message,
      details: error
    });
  }
}; 