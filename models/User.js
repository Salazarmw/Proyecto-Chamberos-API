const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  user_type: { type: String, enum: ['client', 'chambero'], required: true },
  profile_photo: { type: String },
  birth_date: { type: Date },
  address: { type: String },
  province: { type: String },
  canton: { type: String },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

module.exports = mongoose.model('User', userSchema);