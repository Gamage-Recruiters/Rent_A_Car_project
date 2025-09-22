const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/Customer/dashboardController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');


router.get('/overview', verifyCustomerToken, dashboardController.getCustomerOverview);


router.get('/stats', verifyCustomerToken, dashboardController.getDetailedBookingStats);

module.exports = router;