const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  quotation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  status: { type: String, required: true },
  client_ok: { type: String },
  chambero_ok: { type: String }
});

module.exports = mongoose.model('Job', jobSchema);