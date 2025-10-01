const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/Customer/reviewController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');

// Temporarily disabled authentication for testing
router.post('/', reviewController.createReview);
router.post('/booking/:bookingId', reviewController.createBookingReview);
router.get('/vehicle/:vehicleId', reviewController.getVehicleReviews);
router.get('/all', reviewController.getAllReviews);
router.get('/my-reviews', reviewController.getCustomerReviews);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);
router.get('/rating/:vehicleId', reviewController.getVehicleRating);module.exports = router; 