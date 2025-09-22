const express = require('express');
const router = express.Router();
const { verifySuperAdminToken } = require('../../middleware/Auth/verifyToken');
const { isSuperAdmin } = require('../../middleware/Auth/authorization');
const { getPendingVehicles, approveVehicle, rejectVehicle, getApprovedVehicles,countApprovedVehicles,searchVehicles } = require('../../controllers/Admin/admin-VehicleController');

// Get all pending vehicles
router.get('/vehicles/pending', verifySuperAdminToken, isSuperAdmin, getPendingVehicles);

// Approve a vehicle
router.patch('/vehicles/approve/:id', verifySuperAdminToken, isSuperAdmin, approveVehicle);

// Reject a vehicle
router.delete('/vehicles/reject/:id', verifySuperAdminToken, isSuperAdmin, rejectVehicle);

// Get all approved vehicles
router.get('/vehicles/approved', verifySuperAdminToken, isSuperAdmin, getApprovedVehicles);

// Count only approved vehicles
router.get('/vehicles/count/approved', verifySuperAdminToken, isSuperAdmin, countApprovedVehicles);

// Search/filter vehicles
router.get('/vehicles/search', verifySuperAdminToken, isSuperAdmin, searchVehicles);
module.exports = router;