const Booking = require("../../Models/bookingModel");
const Vehicle = require("../../Models/vehicleModel");

async function changeBookingStatus(req, res) {
    try{
        const {bookingId, bookingStatus} = req.params;

        // Owner can't make bookingStatus to pending
        if (bookingStatus === 'pending') {
            return res.status(400).json({
                message: 'Invalid booking status. Must be "confirmed", "cancelled" or "completed"'
            });
        }

        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        // Check if booking is for the exact owner
        if (booking.owner.toString() !== req.user.id) {
            return res.status(409).json({
                message: 'Unauthorized: You can\'t manage others\' bookings.'
            });
        }

        // Owner can't change status if it's cancelled or completed. 
        if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'completed') {
            return res.status(400).json({
                message: 'You can\'t change booking status after it\'s completed or cancelled.'
            })
        }

        // Making vehicle unavailable upon booking confirmation & avaialable upon booking completion
        if (bookingStatus === 'confirmed') {
            await Vehicle.findByIdAndUpdate(
                booking.vehicle, 
                { isAvailable: false }
            );
        } else if (bookingStatus === 'completed') {
            await Vehicle.findByIdAndUpdate(
                booking.vehicle,
                { isAvailable: true }
            );
        }

        // Save the updated bookingStatus 
        booking.bookingStatus = bookingStatus;
        await booking.save();

        return res.status(200).json({
            message: `Booking ${booking.bookingStatus === 'confirmed' ? 'approved' : booking.bookingStatus} successfully.`
        });
    } catch (error) {
        console.log('Error changing booking status.', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
}

async function getAllBookings(req, res) {
    try{
        const ownerId = req.user.id;
        const bookings = await Booking.find({owner: ownerId })
        .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year vehicleType')
        .populate('customer', 'firstName lastName email phoneNumber');

        return res.status(200).json({
            message: 'All bookings successfull received.',
            bookings
        });
    } catch (error) {
        console.log('Error getting all bookings for owner.', error);
        return res.status(500).json({
            message: 'Server error.',
            error: error.message
        });
    }
}

// To get booking requests
async function getPendingBookings(req, res) {
    try{
        const ownerId = req.user.id;
        const bookings = await Booking.find({
            owner: ownerId,
            bookingStatus: 'pending'
        }).populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year vehicleType')
        .populate('customer', 'firstName lastName email phoneNumber');

        return res.status(200).json({
            message: 'All pending bookings successfully received.',
            bookings
        });

    } catch (error) {
        console.log('Error getting pending bookings for owner.', error);
        return res.status(500).json({
            message: 'Server error.',
            error: error.message
        });
    }
}

// To get all completed bookings
async function getCompletedBookings(req, res) {
    try{
        const ownerId = req.user.id;
        const bookings = await Booking.find({
            owner: ownerId,
            bookingStatus: 'completed'
        }).populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year vehicleType')
        .populate('customer', 'firstName lastName email phoneNumber');

        return res.status(200).json({
            message: 'All completed bookings/rentals are successfully received.',
            bookings
        });

    } catch (error) {
        console.log('Error getting completed bookings for owner.', error);
        return res.status(500).json({
            message: 'Server error.',
            error: error.message
        });
    }
}

module.exports = {
    changeBookingStatus,
    getAllBookings,
    getPendingBookings,
    getCompletedBookings
}