const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chambero_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service_description: { type: String, required: true },
  scheduled_date: { type: Date, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true }
});

module.exports = mongoose.model('Quotation', quotationSchema);