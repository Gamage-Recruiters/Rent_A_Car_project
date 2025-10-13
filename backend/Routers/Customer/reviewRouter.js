const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/Customer/reviewController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');
const { verifyCustomerFlexible } = require('../../middleware/Auth/flexibleAuth');

// Routes that require authentication
router.post('/', verifyCustomerFlexible, reviewController.createReview);
router.post('/booking/:bookingId', verifyCustomerFlexible, reviewController.createBookingReview);
router.get('/my-reviews', verifyCustomerFlexible, reviewController.getCustomerReviews);
router.put('/:reviewId', verifyCustomerFlexible, reviewController.updateReview);
router.delete('/:reviewId', verifyCustomerFlexible, reviewController.deleteReview);

// Public routes (no authentication required)
router.get('/vehicle/:vehicleId', reviewController.getVehicleReviews);
router.get('/all', reviewController.getAllReviews);
router.get('/rating/:vehicleId', reviewController.getVehicleRating);module.exports = router; 