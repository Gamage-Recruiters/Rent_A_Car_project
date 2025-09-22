const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vehicle',
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'owner',
        required: true,
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropoffLocation: {
        type: String,
        required: true
    },
    pickupDate: {
        type: Date,
        required: true
    },
    dropoffDate: {
        type: Date,
        required: true
    },
    idDocument: {
        type: [String], 
        required: true
    },
    drivingLicenseDocument: {
        type: [String],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
})

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;