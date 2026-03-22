const mongoose = require('mongoose');

const weatherLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String },
  temperature: { type: Number },
  humidity: { type: Number },
  windSpeed: { type: Number },
  rainChance: { type: Number },
  advice: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WeatherLog', weatherLogSchema);
