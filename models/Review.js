const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
});

module.exports = mongoose.model('Review', reviewSchema);