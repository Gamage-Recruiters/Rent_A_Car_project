const express = require('express');
const router = express.Router();
const rentalHistoryController = require('../../controllers/Customer/rentalHistoryController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');


router.get('/', verifyCustomerToken, rentalHistoryController.getCustomerRentalHistory);

module.exports = router;