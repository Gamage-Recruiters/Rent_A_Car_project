const Booking = require('../../Models/bookingModel');

async function getCustomerRentalHistory (req, res) {
    try {

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const bookings = await Booking.find({ customer: req.user.id })
            .populate('vehicle', 'vehicleName vehicleLicenseNumber')
            .populate('owner', 'firstName lastName email')
            .populate('customer', 'firstName lastName email')
            .sort({createdAt: -1});
            
            return res.status(200).json({
                success: true,
                count: bookings.length,
                data: bookings
            });
    } catch (error) {
        console.error('Error fetching rental history:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { getCustomerRentalHistory };