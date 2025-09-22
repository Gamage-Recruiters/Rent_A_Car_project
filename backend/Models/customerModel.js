const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    googleId: {
        type: String,
        sparse: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, "Invalid email format"]
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        }
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    driversLicense: {
        type: String,
        default: ''
    },
    emergencyContact: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    photo: {
        type: String,
        default: null
    },

    image: {
        public_id: {
            type: String,
            default: null,
        },
        url: {
            type: String,
            default: null,
        }
    },
    userRole: {
        type: String,
        default: 'customer'
    },
    isNewsletterSubscribed: {
        type: Boolean,
        default: false
    },
    newsletterSubscribedAt: {
        type: Date,
        default: null
    },
    newsletterUnsubscribedAt: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    createdAt: { type: Date, default: Date.now }

},
    {
        timestamps: true,
    }
);

const Customer = mongoose.model('customer', customerSchema);
module.exports = Customer;