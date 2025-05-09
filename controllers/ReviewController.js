const Review = require("../models/Review");
const Job = require("../models/Job");

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("fromUser", "name")
      .populate("toUser", "name");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("fromUser", "name")
      .populate("toUser", "name");
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Determinar quién es el reviewer y el reviewee
    const fromUser = req.user._id;
    const toUser = req.user.user_type === "client" ? job.chambero_id : job.client_id;

    const review = new Review({
      fromUser: fromUser,
      toUser: toUser,
      rating,
      comment,
      // No incluyas jobId si el modelo no lo requiere
    });

    const newReview = await review.save();
    job.has_review = true;
    await job.save();

    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { offset = 0, limit = 10 } = req.query;

    const reviews = await Review.find({ toUser: userId })
      .populate("fromUser", "name")
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json({ reviews });
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ message: err.message });
  }
};
