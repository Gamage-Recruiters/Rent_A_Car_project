const Booking = require('../../Models/bookingModel');
const Vehicle = require('../../Models/vehicleModel');

async function createBooking(req, res) {
    try {
        const { vehicle, pickupLocation, dropoffLocation, pickupDate, dropoffDate, totalAmount } = req.body;

        if (!req.files || 
            !req.files.customerIdImage || 
            !req.files.customerLicenseImage || 
            req.files.customerIdImage.length < 2 || 
            req.files.customerLicenseImage.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please upload both front and back images of your ID and driving license'
            });
        }

        const idDocumentPaths = req.files.customerIdImage.map(file => 
            `/uploads/customerIdImage/${file.filename}`
        );

        const licenseDocumentPaths = req.files.customerLicenseImage.map(file => 
            `/uploads/customerLicenseImage/${file.filename}`
        );

        const newBooking = await Booking.create({
            customer: req.user.id,
            vehicle,
            owner: req.body.owner, 
            pickupLocation,
            dropoffLocation,
            pickupDate,
            dropoffDate,
            totalAmount,
            idDocument: idDocumentPaths,
            drivingLicenseDocument: licenseDocumentPaths
        });

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: newBooking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function getCustomerBookings(req, res) {
    try {
        const bookings = await Booking.find({ customer: req.user.id }).populate('vehicle').populate('owner');
        return res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function cancelBooking(req, res) {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking || booking.customer.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or unauthorized'
            });
        }

        booking.bookingStatus = 'cancelled';
        await booking.save();

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


async function getBookingById(req, res) {
    try {
        const booking = await Booking.findById(req.params.id).populate('vehicle').populate('owner');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.customer._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this booking'
            });
        }

        return res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Get booking by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { createBooking, getCustomerBookings, getBookingById, cancelBooking };