const express = require('express');
const router = express.Router();
const { getPendingOwners, approveOwner, rejectOwner,getApprovedOwners} = require('../../controllers/Admin/admin-ownerController');
const { verifySuperAdminToken } = require('../../middleware/Auth/verifyToken');
const { isSuperAdmin } = require('../../middleware/Auth/authorization');

// View all pending owner registration requests
router.get('/owners/pending', verifySuperAdminToken, isSuperAdmin, getPendingOwners);

// Approve a specific owner by ID
router.patch('/owners/approve/:id', verifySuperAdminToken, isSuperAdmin, approveOwner);

// Reject a specific owner by ID
router.patch('/owners/reject/:id', verifySuperAdminToken, isSuperAdmin, rejectOwner);

// Get All Aproved List ANd Rejected List
router.get('/owners/approved', verifySuperAdminToken, isSuperAdmin, getApprovedOwners);

module.exports = router;