const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  admin: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // or 'superadmin'
    name: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const contactSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer',
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  emailAddress: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  subject: {
    type: String,
    required: true,
    enum: [
      'Booking Inquiry',
      'Customer Support',
      'Become a Partner',
      'Feedback',
      'Other'
    ]
  },
  message: { type: String, required: true },
  replies: [replySchema]  // 🔥 NEW
},
{ timestamps: true }
);

const Contact = mongoose.model('contact', contactSchema);

module.exports = Contact;
