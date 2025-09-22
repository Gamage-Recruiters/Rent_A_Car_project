const express = require('express');
const router = express.Router();
const newsletterController = require('../../controllers/Customer/newsLetterController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');

router.get('/status', verifyCustomerToken, newsletterController.getNewsletterStatus);
router.post('/subscribe', verifyCustomerToken, newsletterController.subscribeNewsletter);
router.post('/unsubscribe', verifyCustomerToken, newsletterController.unsubscribeNewsletter);

module.exports = router;