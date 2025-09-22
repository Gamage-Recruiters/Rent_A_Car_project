const ownerVehicleController = require('../../controllers/Owner/owner-VehicleController');
const { verifyOwnerToken } = require('../../middleware/Auth/verifyToken');
const upload = require('../../utils/multer');

const router = require('express').Router();

// id should be the mongo id of the owner model
router.post('/register', verifyOwnerToken, upload.array('vehicleImages', 5), ownerVehicleController.registerVehicle);

// Get all vehicles
router.get('/all', verifyOwnerToken, ownerVehicleController.getAllVehiclesByOwnerId);

// Get vehicle by id
router.get('/:id', verifyOwnerToken, ownerVehicleController.getVehicle);

// Get unavailable dates
router.get('/:id/availability', verifyOwnerToken, ownerVehicleController.getAvailability);

// Update vehicle
router.put('/:id', verifyOwnerToken, upload.array('vehicleImages', 5), ownerVehicleController.updateVehicle);

// Block dates (making dates unavailable for the vehicle)
// DATE FORMAT: YYYY-MM-DD
router.put('/:id/block-dates', verifyOwnerToken, ownerVehicleController.blockDates);

// Unblock dates (making dates available for the vehicle)
router.delete('/:id/unblock-dates', verifyOwnerToken, ownerVehicleController.unblockDates);

// Delete vehicle
router.delete('/:id', verifyOwnerToken, ownerVehicleController.deleteVehicle);

// Delete vehicle image
router.delete('/:id/images/:imageId', verifyOwnerToken, ownerVehicleController.deleteVehicleImage);

module.exports = router;