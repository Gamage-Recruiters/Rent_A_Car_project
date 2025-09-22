const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customer',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    default: ''
  },
  emailAddress: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    default: ''
  },
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
  message: {
    type: String,
    required: true
  }
},
  {
  timestamps: true
});

const Contact = mongoose.model('contact', contactSchema);

module.exports = Contact;
