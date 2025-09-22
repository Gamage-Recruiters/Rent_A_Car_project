const express = require('express');
const { verifyOwnerToken } = require('../../middleware/Auth/verifyToken');
const { getAllBookings, getPendingBookings, changeBookingStatus, getCompletedBookings } = require('../../controllers/Owner/owner-bookingController');

const router = express.Router();

//Get all bookings for the owner
router.get('/', verifyOwnerToken, getAllBookings);

// Get pending bookings/ booking requests
router.get('/pending', verifyOwnerToken, getPendingBookings);

// Get completed bookings/ sucessful rentals
router.get('/completed', verifyOwnerToken, getCompletedBookings);

//Change bookingStatus for a specific booking
router.put('/:bookingId/:bookingStatus', verifyOwnerToken, changeBookingStatus);

module.exports = router;