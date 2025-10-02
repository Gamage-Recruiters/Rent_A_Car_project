const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/Customer/bookingController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');
const upload = require('../../utils/multer');

router.post('/create', verifyCustomerToken,
        upload.fields([
          { name: 'customerIdImage', maxCount: 2 },
          { name: 'customerLicenseImage', maxCount: 2 }
        ]), bookingController.createBooking);
router.get('/my-bookings', verifyCustomerToken, bookingController.getCustomerBookings);
router.put('/update/:id', verifyCustomerToken, bookingController.updateBooking);
router.put('/cancel/:id', verifyCustomerToken, bookingController.cancelBooking);
router.get('/:id', verifyCustomerToken, bookingController.getBookingById);

module.exports = router;