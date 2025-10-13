const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'booking',
        required: false // Optional for backward compatibility
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true
});

const Review = mongoose.model('review', reviewSchema);
module.exports = Review;
