const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  quotation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chambero_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['in_progress', 'completed', 'failed'],
    default: 'in_progress'
  },
  client_ok: { 
    type: Boolean, 
    default: false 
  },
  chambero_ok: { 
    type: Boolean, 
    default: false 
  }
});

// Middleware para actualizar el estado cuando ambos aprueban
jobSchema.pre('save', function(next) {
  if (this.client_ok && this.chambero_ok) {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);