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
        const bookings = await Booking.find({ customer: req.user.id }).populate('vehicle').populate('owner').populate('customer');
        
        // Filter out bookings with null references (deleted vehicles/owners)
        const validBookings = bookings.filter(booking => {
            if (!booking.vehicle) {
                console.warn(`⚠️  Booking ${booking._id} has null vehicle reference - filtering out`);
                return false;
            }
            if (!booking.owner) {
                console.warn(`⚠️  Booking ${booking._id} has null owner reference - filtering out`);
                return false;
            }
            if (!booking.customer) {
                console.warn(`⚠️  Booking ${booking._id} has null customer reference - filtering out`);
                return false;
            }
            return true;
        });
        
        console.log(`📊 Returning ${validBookings.length} out of ${bookings.length} bookings (filtered ${bookings.length - validBookings.length} with null references)`);
        
        return res.status(200).json({
            success: true,
            bookings: validBookings
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


async function updateBooking(req, res) {
    try {
        console.log('Update booking called with ID:', req.params.id);
        console.log('Update booking request body:', req.body);
        console.log('User ID from token:', req.user.id);
        
        const { pickupLocation, dropoffLocation, pickupDate, dropoffDate, totalAmount } = req.body;
        
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to update this booking'
            });
        }

        // Only allow updates for pending bookings
        if (booking.bookingStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending bookings can be updated'
            });
        }

        // Update only provided fields
        console.log('=== BACKEND UPDATE DEBUG ===');
        console.log('Original booking dates - pickup:', booking.pickupDate, 'dropoff:', booking.dropoffDate);
        
        if (pickupLocation !== undefined) {
            console.log('Updating pickup location:', pickupLocation);
            booking.pickupLocation = pickupLocation;
        }
        if (dropoffLocation !== undefined) {
            console.log('Updating dropoff location:', dropoffLocation);
            booking.dropoffLocation = dropoffLocation;
        }
        if (pickupDate !== undefined) {
            console.log('Updating pickup date from', booking.pickupDate, 'to', pickupDate);
            booking.pickupDate = pickupDate;
        }
        if (dropoffDate !== undefined) {
            console.log('Updating dropoff date from', booking.dropoffDate, 'to', dropoffDate);
            booking.dropoffDate = dropoffDate;
        }
        if (totalAmount !== undefined) {
            console.log('Updating total amount:', totalAmount);
            booking.totalAmount = totalAmount;
        }

        console.log('Final booking dates before save - pickup:', booking.pickupDate, 'dropoff:', booking.dropoffDate);
        console.log('===============================');

        await booking.save();

        // Populate and return the updated booking
        const updatedBooking = await Booking.findById(booking._id).populate('vehicle').populate('owner').populate('customer');

        return res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            booking: updatedBooking
        });
    } catch (error) {
        console.error('Update booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function getBookingById(req, res) {
    try {
        const booking = await Booking.findById(req.params.id).populate('vehicle').populate('owner').populate('customer');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check for null references (deleted vehicle/owner/customer)
        if (!booking.vehicle) {
            console.warn(`⚠️  Booking ${booking._id} has null vehicle reference`);
            return res.status(404).json({
                success: false,
                message: 'Booking data is corrupted - associated vehicle not found'
            });
        }

        if (!booking.owner) {
            console.warn(`⚠️  Booking ${booking._id} has null owner reference`);
            return res.status(404).json({
                success: false,
                message: 'Booking data is corrupted - associated owner not found'
            });
        }

        if (!booking.customer) {
            console.warn(`⚠️  Booking ${booking._id} has null customer reference`);
            return res.status(404).json({
                success: false,
                message: 'Booking data is corrupted - customer not found'
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

module.exports = { createBooking, getCustomerBookings, getBookingById, cancelBooking, updateBooking };