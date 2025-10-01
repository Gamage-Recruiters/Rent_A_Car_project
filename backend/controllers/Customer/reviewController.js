const Review = require('../../Models/reviewModel');
const Booking = require('../../Models/bookingModel');

async function createReview(req, res) {
    try {
        const { vehicle, rating, comment, booking } = req.body;

        // Temporary user ID for testing (when auth is bypassed)
        const userId = req.user ? req.user.id : '672192b675ae443b22b4d5ba';

        console.log('Creating regular review with data:', { vehicle, rating, comment, booking, userId });

        const review = await Review.create({
            customer: userId,
            vehicle,
            rating,
            comment,
            ...(booking && { booking })
        });

        return res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: review
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

async function createBookingReview(req, res) {
    try {
        const { bookingId } = req.params;
        const { rating, comment } = req.body;

        console.log('Creating booking review for booking:', bookingId);
        console.log('Review data:', { rating, comment });

        // Temporary user ID for testing (when auth is bypassed)
        const userId = req.user ? req.user.id : '672192b675ae443b22b4d5ba';

        // First, verify the booking exists and belongs to the customer
        const booking = await Booking.findById(bookingId).populate('vehicle');
        
        if (!booking) {
            console.log('Booking not found:', bookingId);
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('Found booking:', booking._id, 'Customer:', booking.customer);
        console.log('Booking status:', booking.bookingStatus, 'Payment status:', booking.paymentStatus);

        if (req.user && booking.customer.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this booking'
            });
        }

        if (booking.bookingStatus !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed bookings. Current status: ' + booking.bookingStatus
            });
        }

        if (booking.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment must be completed before adding a review. Current payment status: ' + booking.paymentStatus
            });
        }

        // Check if a review already exists for this booking
        const existingReview = await Review.findOne({ 
            booking: bookingId, 
            customer: userId 
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this booking'
            });
        }

        console.log('Creating review with data:', {
            customer: userId,
            vehicle: booking.vehicle._id,
            booking: bookingId,
            rating,
            comment
        });

        const review = await Review.create({
            customer: userId,
            vehicle: booking.vehicle._id,
            booking: bookingId,
            rating,
            comment
        });

        // Populate the review data for response
        const populatedReview = await Review.findById(review._id)
            .populate('customer', 'firstName lastName email photo')
            .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year images vehicleType')
            .populate('booking');

        return res.status(201).json({
            success: true,
            message: 'Booking review added successfully',
            data: populatedReview
        });
    } catch (error) {
        console.error('Create booking review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};


async function getVehicleReviews(req, res) {
    try {
        const reviews = await Review.find({ vehicle: req.params.vehicleId })
            .populate('customer', 'firstName lastName email photo')
            .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year images vehicleType')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

async function deleteReview(req, res) {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review || review.customer.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Review not found or not authorized'
            });
        }

        await review.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

async function getCustomerReviews(req, res) {
    try {
        // Temporary user ID for testing (when auth is bypassed)
        const userId = req.user ? req.user.id : '672192b675ae443b22b4d5ba';
        
        const reviews = await Review.find({ customer: userId })
            .populate('customer', 'firstName lastName email photo') 
            .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year images vehicleType') 
            .sort({ createdAt: -1 });

        console.log(`Found ${reviews.length} reviews for customer ${req.user.id}`);
        
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get customer reviews error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Valid rating (1-5) is required'
            });
        }

        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { rating, comment: comment || '' },
            { new: true }
        ).populate('customer', 'firstName lastName email')
         .populate('vehicle', 'vehicleName vehicleLicenseNumber');

        return res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: updatedReview
        });
    } catch (error) {
        console.error('Update review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

async function getAllReviews(req, res) {
    try {
        const reviews = await Review.find()
            .populate('customer', 'firstName lastName email photo')
            .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year images vehicleType')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get all reviews error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

async function getVehicleRating(req, res) {
    try {
        const { vehicleId } = req.params;
        
        const reviews = await Review.find({ vehicle: vehicleId });
        
        if (!reviews || reviews.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    rating: 0,
                    reviewCount: 0
                }
            });
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        
        return res.status(200).json({
            success: true,
            data: {
                rating: parseFloat(averageRating),
                reviewCount: reviews.length
            }
        });
    } catch (error) {
        console.error('Get vehicle rating error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
}

module.exports = { 
    createReview, 
    createBookingReview, 
    getVehicleReviews, 
    deleteReview, 
    getCustomerReviews, 
    updateReview, 
    getAllReviews, 
    getVehicleRating 
};