const express = require('express');
const router = express.Router();
const customerVehicleController = require('../../controllers/Customer/vehicleController');

router.get('/search', customerVehicleController.searchVehicles);
router.get('/', customerVehicleController.getAllVehicles);
router.get('/:id', customerVehicleController.getVehicleById);

module.exports = router;