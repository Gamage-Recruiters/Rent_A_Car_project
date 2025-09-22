const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({

    isAvailable: {   // its Rented or available for rent
        type: Boolean,
        required: true,
        default: true
        // true : available for rent, 
        // false : Already rented  (taken by a customer)
        // if vehicle finished its rented perioud or check available vehicles, only this field will be use or update
    },
    unavailableDates: [{
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            enum: ['booked', 'maintenance', 'owner_blocked'],
            default: 'owner_blocked'
        }
    }],
    isApproved: {
        type: Boolean,
        default: false
    },
    vehicleName: {
        type: String,
        required: true
    },
    vehicleLicenseNumber: {
        type: String,
        required: true,
        unique: true,
        // from this can check if vehicle is alreadt exist 
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: [] // defualt empty array, to be added as many images. Saved as relative paths.
    },
    description: {
        type: String,
    },
    noSeats: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        required: true
    },
    transmission: {
        type: String,
        required: true
    },
    mileage: {
        type: String,
    },
    isDriverAvailable: {
        type: Boolean,
        default:false
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    pricePerDistance: {
        type: Number,
        required: true
    },
    location: {
        type: String,
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    email: {
        type: String,
    },
    pickupAddress: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'owner',
        required: true
    }
})


const Vehicle = mongoose.model('vehicle', vehicleSchema);
module.exports = Vehicle;