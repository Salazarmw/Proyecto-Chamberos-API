const Tag = require("../models/Tag");
const mongoose = require("mongoose");

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({
      count: tags.length,
      tags,
    });
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({
      message: "Error al obtener las etiquetas",
      error: err.message,
    });
  }
};

exports.getTagById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de etiqueta inválido" });
    }

    const tag = await Tag.findById(req.params.id);
    if (!tag)
      return res.status(404).json({ message: "Etiqueta no encontrada" });

    res.json(tag);
  } catch (err) {
    console.error("Error fetching tag by id:", err);
    res.status(500).json({
      message: "Error al obtener la etiqueta",
      error: err.message,
    });
  }
};

exports.createTag = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({
        message: "El nombre de la etiqueta es requerido",
        errors: { name: "El nombre de la etiqueta es requerido" },
      });
    }

    const tag = new Tag({
      name: req.body.name,
      description: req.body.description || "",
    });

    const newTag = await tag.save();
    res.status(201).json({
      message: "Etiqueta creada exitosamente",
      tag: newTag,
    });
  } catch (err) {
    console.error("Error creating tag:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Ya existe una etiqueta con ese nombre",
        errors: { name: "Ya existe una etiqueta con ese nombre" },
      });
    }

    if (err.name === "ValidationError") {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({
        message: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      message: "Error al crear la etiqueta",
      error: err.message,
    });
  }
};

exports.updateTag = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de etiqueta inválido" });
    }

    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tag)
      return res.status(404).json({ message: "Etiqueta no encontrada" });

    res.json({
      message: "Etiqueta actualizada exitosamente",
      tag,
    });
  } catch (err) {
    console.error("Error updating tag:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Ya existe una etiqueta con ese nombre",
        errors: { name: "Ya existe una etiqueta con ese nombre" },
      });
    }

    if (err.name === "ValidationError") {
      const errors = {};
      for (const field in err.errors) {
        errors[field] = err.errors[field].message;
      }
      return res.status(400).json({
        message: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      message: "Error al actualizar la etiqueta",
      error: err.message,
    });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID de etiqueta inválido" });
    }

    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag)
      return res.status(404).json({ message: "Etiqueta no encontrada" });

    res.json({ message: "Etiqueta eliminada exitosamente" });
  } catch (err) {
    console.error("Error deleting tag:", err);
    res.status(500).json({
      message: "Error al eliminar la etiqueta",
      error: err.message,
    });
  }
};
