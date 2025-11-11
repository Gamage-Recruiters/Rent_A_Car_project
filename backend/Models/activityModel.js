const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, default: 'system' },
  type: { type: String, default: 'general' },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);