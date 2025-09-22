const ownerProfileController = require('../../controllers/Owner/owner-profileController');
const { verifyOwnerToken } = require('../../middleware/Auth/verifyToken');
const upload = require('../../utils/multer');

const router = require('express').Router();

router.get('/', verifyOwnerToken, ownerProfileController.getOwnerProfile);
router.put('/', verifyOwnerToken, upload.single('ownerProfileImage'), ownerProfileController.updateOwnerProfile);
router.delete('/', verifyOwnerToken, ownerProfileController.deleteOwnerProfile);

module.exports = router