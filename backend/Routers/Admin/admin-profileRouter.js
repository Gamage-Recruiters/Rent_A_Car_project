const express = require('express');
const router = express.Router();
const { getAdminProfile, updateAdminProfile, changeAdminPassword } = require('../../controllers/Admin/admin-profileController');
const { verifySuperAdminToken } = require('../../middleware/Auth/verifyToken');
const { isSuperAdmin } = require('../../middleware/Auth/authorization');

router.get('/profile', verifySuperAdminToken, isSuperAdmin, getAdminProfile);
router.put('/profile', verifySuperAdminToken, isSuperAdmin, updateAdminProfile);
router.put('/profile/change-password', verifySuperAdminToken, isSuperAdmin, changeAdminPassword);

module.exports = router;