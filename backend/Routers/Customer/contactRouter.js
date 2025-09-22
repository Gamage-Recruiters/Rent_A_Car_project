const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/Customer/contactController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');

router.post('/submit-message', verifyCustomerToken, contactController.submitMessage);
router.get('/my-messages', verifyCustomerToken, contactController.getCustomerMessages);

module.exports = router;