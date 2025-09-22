const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/Customer/reviewController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');

router.post('/', verifyCustomerToken, reviewController.createReview);
router.get('/vehicle/:vehicleId', reviewController.getVehicleReviews); 
router.get('/my-reviews', verifyCustomerToken, reviewController.getCustomerReviews);
router.put('/:reviewId', verifyCustomerToken, reviewController.updateReview);
router.delete('/:reviewId', verifyCustomerToken, reviewController.deleteReview);

module.exports = router; 