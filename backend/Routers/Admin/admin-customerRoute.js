const express = require('express');
const router = express.Router();
const { getAllCustomers, countCustomers,getAllInquiries,getInquiryById,countInquiries } = require('../../controllers/Admin/admin-customerController');
const { verifySuperAdminToken } = require('../../middleware/Auth/verifyToken');
const { isSuperAdmin } = require('../../middleware/Auth/authorization');


router.get('/customers', verifySuperAdminToken, isSuperAdmin, getAllCustomers);
router.get('/customers/count', verifySuperAdminToken, isSuperAdmin, countCustomers);
// Inquiry routes
router.get('/customers/inquiries', verifySuperAdminToken, isSuperAdmin, getAllInquiries);
router.get('/customers/inquiries/count', verifySuperAdminToken, isSuperAdmin, countInquiries);
router.get('/customers/inquiries/:id', verifySuperAdminToken, isSuperAdmin, getInquiryById);


module.exports = router;