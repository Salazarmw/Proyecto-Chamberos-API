const mongoose = require('mongoose');

const usersTagSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tag_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true }
});

module.exports = mongoose.model('UsersTag', usersTagSchema);