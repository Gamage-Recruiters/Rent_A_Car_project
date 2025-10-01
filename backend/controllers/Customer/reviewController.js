const Review = require('../../Models/reviewModel');
const Booking = require('../../Models/bookingModel');

async function createReview(req, res) {
    try {
        const { vehicle, rating, comment, booking } = req.body;

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to create a review'
            });
        }

        const userId = req.user.id;

        // Validate required fields
        if (!vehicle || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID, rating, and comment are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user has already reviewed this vehicle (for non-booking reviews)
        if (!booking) {
            const existingReview = await Review.findOne({
                customer: userId,
                vehicle: vehicle,
                booking: { $exists: false }
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reviewed this vehicle'
                });
            }
        }

        console.log('Creating regular review with data:', { vehicle, rating, comment, booking, userId });

        const review = await Review.create({
            customer: userId,
            vehicle,
            rating,
            comment,
            ...(booking && { booking })
        });

        // Populate the review data for response
        const populatedReview = await Review.findById(review._id)
            .populate('customer', 'firstName lastName email photo')
            .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year images vehicleType');

        return res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: populatedReview
        });
    } catch (error) {
        console.error('Create review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

async function createBookingReview(req, res) {
    try {
        const { bookingId } = req.params;
        const { rating, comment } = req.body;

        console.log('Creating booking review for booking:', bookingId);
        console.log('Review data:', { rating, comment });

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to create a review'
            });
        }

        const userId = req.user.id;

        // Validate required fields
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

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

        // Verify booking belongs to the authenticated user
        if (booking.customer.toString() !== userId) {
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
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to delete a review'
            });
        }

        const review = await Review.findById(req.params.reviewId);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.customer.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await review.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

async function getCustomerReviews(req, res) {
    try {
        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required to get your reviews'
            });
        }

        const userId = req.user.id;
        
        const reviews = await Review.find({ customer: userId })
            .populate('customer', 'firstName lastName email photo') 
            .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year images vehicleType') 
            .sort({ createdAt: -1 });

        console.log(`Found ${reviews.length} reviews for customer ${userId}`);
        
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
        console.log('🔄 Backend: Update review controller called');
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        
        console.log('🆔 Review ID:', reviewId);
        console.log('📝 Request body:', { rating, comment });
        console.log('👤 User from token:', req.user);

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            console.log('❌ No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required to update a review'
            });
        }

        console.log('✅ User authenticated:', req.user.id);

        if (!rating || rating < 1 || rating > 5) {
            console.log('❌ Invalid rating:', rating);
            return res.status(400).json({
                success: false,
                message: 'Valid rating (1-5) is required'
            });
        }

        if (!comment || comment.trim() === '') {
            console.log('❌ Empty comment:', comment);
            return res.status(400).json({
                success: false,
                message: 'Comment is required'
            });
        }

        console.log('🔍 Finding review by ID...');
        const review = await Review.findById(reviewId);
        
        if (!review) {
            console.log('❌ Review not found:', reviewId);
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        console.log('📄 Found review:', review._id, 'Owner:', review.customer);
        console.log('👤 Current user:', req.user.id);

        if (review.customer.toString() !== req.user.id) {
            console.log('❌ User not authorized to update this review');
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        console.log('💾 Updating review with data:', { rating, comment: comment.trim() });
        
        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { rating, comment: comment.trim() },
            { new: true }
        ).populate('customer', 'firstName lastName email photo')
         .populate('vehicle', 'vehicleName vehicleLicenseNumber brand model year images vehicleType');

        console.log('✅ Review updated successfully:', updatedReview._id);

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