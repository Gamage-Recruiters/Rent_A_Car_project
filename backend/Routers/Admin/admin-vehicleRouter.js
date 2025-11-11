const express = require('express');
const router = express.Router();
const { verifySuperAdminToken } = require('../../middleware/Auth/verifyToken');
const { isSuperAdmin } = require('../../middleware/Auth/authorization');
const { getPendingVehicles, approveVehicle, rejectVehicle, getApprovedVehicles,countApprovedVehicles,searchVehicles,getVehicleById,countPendingVehicles, countRejectedVehicles} = require('../../controllers/Admin/admin-VehicleController');

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

//  Count pending vehicles
router.get('/vehicles/count/pending', verifySuperAdminToken, isSuperAdmin, countPendingVehicles);

// Count rejected vehicles
router.get('/vehicles/count/rejected', verifySuperAdminToken, isSuperAdmin, countRejectedVehicles);

// Search/filter vehicles
router.get('/vehicles/search', verifySuperAdminToken, isSuperAdmin, searchVehicles);

// Get single vehicle by id
router.get('/vehicles/:id', verifySuperAdminToken, isSuperAdmin, getVehicleById);

module.exports = router;