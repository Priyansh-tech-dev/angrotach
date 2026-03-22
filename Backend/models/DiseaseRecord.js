const mongoose = require('mongoose');

const diseaseRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inputType: { type: String, enum: ['text', 'image', 'live'], default: 'text' },
  symptoms: { type: String },
  diagnosis: { type: String },
  severity: { type: String },
  recommendation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DiseaseRecord', diseaseRecordSchema);
