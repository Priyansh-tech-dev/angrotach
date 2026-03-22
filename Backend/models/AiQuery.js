const mongoose = require('mongoose');

const aiQuerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: String, required: true },
  reply: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AiQuery', aiQuerySchema);
