const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Stats', statsSchema);