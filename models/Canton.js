const mongoose = require('mongoose');

const CantonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  province_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
});

module.exports = mongoose.model('Canton', CantonSchema);