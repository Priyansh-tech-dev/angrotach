const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  userid: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  district: { type: String },
  role: { type: String, enum: ['farmer', 'buyer', 'admin'], default: 'farmer' },
  blocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
