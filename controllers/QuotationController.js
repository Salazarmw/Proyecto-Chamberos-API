const Quotation = require("../models/Quotation");
const Job = require("../models/Job");
const mongoose = require("mongoose");

exports.getAllQuotations = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let query = {};

    // Filter based on user type
    if (user.user_type === 'client') {
      query.client_id = user._id;
    } else if (user.user_type === 'chambero') {
      query.chambero_id = user._id;
    }

    // Add status filters if they exist
    if (req.query.status && Array.isArray(req.query.status)) {
      query.status = { $in: req.query.status };
    }

    const quotations = await Quotation.find(query)
      .populate("client_id", "name email")
      .populate("chambero_id", "name email")
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (err) {
    console.error("Error fetching quotations:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("client_id", "name email")
      .populate("chambero_id", "name email");
    if (!quotation)
      return res.status(404).json({ message: "Quotation not found" });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.client_id)) {
      return res.status(400).json({ message: "Invalid client_id format" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.chambero_id)) {
      return res.status(400).json({ message: "Invalid chambero_id format" });
    }

    if (typeof req.body.price !== "number" || req.body.price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    const scheduledDate = new Date(req.body.scheduled_date);
    const today = new Date();
    if (scheduledDate < today) {
      return res
        .status(400)
        .json({ message: "Scheduled date cannot be in the past" });
    }

    const quotation = new Quotation({
      client_id: req.body.client_id,
      chambero_id: req.body.chambero_id,
      service_description: req.body.service_description,
      scheduled_date: req.body.scheduled_date,
      price: req.body.price,
      status: "pending",
    });

    const newQuotation = await quotation.save();

    const populatedQuotation = await Quotation.findById(newQuotation._id)
      .populate("client_id", "name email")
      .populate("chambero_id", "name email");

    res.status(201).json(populatedQuotation);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid quotation ID format" });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (req.body.service_description)
      quotation.service_description = req.body.service_description;
    if (req.body.scheduled_date)
      quotation.scheduled_date = req.body.scheduled_date;
    if (req.body.price) quotation.price = req.body.price;
    if (req.body.status) quotation.status = req.body.status;

    await quotation.save();

    const updatedQuotation = await Quotation.findById(quotation._id)
      .populate("client_id", "name email")
      .populate("chambero_id", "name email");

    res.json(updatedQuotation);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid quotation ID format" });
    }

    const { status } = req.body;
    if (!["pending", "accepted", "rejected", "offer", "counteroffer"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Si es una contraoferta, actualizar también los otros campos
    if (status === "counteroffer") {
      if (req.body.price) quotation.price = req.body.price;
      if (req.body.service_description) quotation.service_description = req.body.service_description;
      if (req.body.scheduled_date) quotation.scheduled_date = req.body.scheduled_date;
    }

    quotation.status = status;
    await quotation.save();

    // If status is 'accepted', create a new Job
    if (status === "accepted") {
      const job = new Job({
        quotation_id: quotation._id,
        client_id: quotation.client_id,
        chambero_id: quotation.chambero_id,
        status: "in_progress",
        client_ok: false,
        chambero_ok: false,
      });
      await job.save();

      const updatedQuotation = await quotation.populate(
        "client_id chambero_id"
      );
      return res.status(201).json({
        message: "Quotation accepted and Job created",
        quotation: updatedQuotation,
        job,
      });
    }

    const updatedQuotation = await quotation.populate("client_id chambero_id");
    res.json({
      message: `Quotation status updated to ${status}`,
      quotation: updatedQuotation,
    });
  } catch (err) {
    console.error("Error updating quotation status:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid quotation ID format" });
    }

    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    res.json({ message: "Quotation deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
