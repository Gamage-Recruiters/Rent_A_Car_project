const router = require('express').Router();
const imageUploadController = require('../../controllers/Cloudinary/imageUploadController');
const upload = require('../../utils/multer'); // 

// ✅ Use upload.single('vehicleImages') — must match the fieldname you used in multer.js
router.post('/upload', upload.single('vehicleImages'), imageUploadController.uploadImage);

module.exports = router;
