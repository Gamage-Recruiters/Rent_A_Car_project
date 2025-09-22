const express = require('express');
const router = express.Router();
const { verifyCustomerToken } = require('../../middleware/Auth/verifyToken');
const profileController = require('../../controllers/Customer/profileController');
const upload = require('../../utils/multer');


router.get('/', verifyCustomerToken, profileController.getProfile);
router.put('/', verifyCustomerToken,upload.single('customerProfileImage'), profileController.updateProfile);
router.put('/photo', verifyCustomerToken, upload.single('customerProfileImage'), profileController.updateProfilePhoto);
router.delete('/photo', verifyCustomerToken, profileController.deleteProfilePhoto);
router.delete('/', verifyCustomerToken, profileController.deleteProfile);
router.get('/with-stats', verifyCustomerToken, profileController.getProfileWithStats);

module.exports = router;