const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/Customer/favoriteController');
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');

router.post('/add', verifyCustomerToken, favoriteController.addToFavorites);
router.delete('/remove/:id', verifyCustomerToken, favoriteController.removeFromFavorites);
router.get('/list', verifyCustomerToken, favoriteController.getFavorites);
router.get('/check/:vehicleId', verifyCustomerToken, favoriteController.checkIfFavorited);

module.exports = router;