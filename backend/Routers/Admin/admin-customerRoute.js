const express = require('express');
const router = express.Router();
const { getAllCustomers, countCustomers,getAllInquiries,getInquiryById,countInquiries ,replyToInquiry,deleteInquiry } = require('../../controllers/Admin/admin-customerController');
const { verifySuperAdminToken } = require('../../middleware/Auth/verifyToken');
const { isSuperAdmin } = require('../../middleware/Auth/authorization');


router.get('/customers', verifySuperAdminToken, isSuperAdmin, getAllCustomers);
router.get('/customers/count', verifySuperAdminToken, isSuperAdmin, countCustomers);
// Inquiry routes
router.get('/customers/inquiries', verifySuperAdminToken, isSuperAdmin, getAllInquiries);
router.get('/customers/inquiries/count', verifySuperAdminToken, isSuperAdmin, countInquiries);
router.get('/customers/inquiries/:id', verifySuperAdminToken, isSuperAdmin, getInquiryById);
router.post('/customers/inquiries/:id/replies', verifySuperAdminToken, isSuperAdmin,replyToInquiry);
router.delete('/customers/inquiries/:id', verifySuperAdminToken, isSuperAdmin, deleteInquiry);



module.exports = router;