const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String },
  farmerPhone: { type: String },
  name: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  quality: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
  status: { type: String, enum: ['available', 'sold', 'reserved', 'cancelled'], default: 'available' },
  reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
