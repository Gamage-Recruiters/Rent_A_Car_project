const Review = require('../../Models/reviewModel');

async function createReview(req, res) {
    try {
        const { vehicle, rating, comment } = req.body;

        const review = await Review.create({
            customer: req.user.id,
            vehicle,
            rating,
            comment
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


async function getVehicleReviews(req, res) {
    try {
        const reviews = await Review.find({ vehicle: req.params.vehicleId })
            .populate('customer', 'firstName email')
            .populate('vehicle', 'vehicleName vehicleLicenseNumber')
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
        const reviews = await Review.find({ customer: req.user.id })
            .populate('vehicle', 'brand model year')
            .sort({ createdAt: -1 });

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

module.exports = { createReview, getVehicleReviews, deleteReview, getCustomerReviews, updateReview };