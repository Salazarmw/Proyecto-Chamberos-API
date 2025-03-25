const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cantons: [{ type: String, required: true }]
});

module.exports = mongoose.model('Province', provinceSchema);
