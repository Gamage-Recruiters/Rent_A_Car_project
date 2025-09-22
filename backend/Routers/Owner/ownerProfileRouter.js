const express = require('express');
const multer = require('multer');
const path = require('path');
const ownerProfileController = require('../../controllers/Owner/owner-profileController');
const { verifyOwnerToken } = require('../../middleware/Auth/verifyToken');

const router = express.Router();

// Multer storage configuration for owner profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ownerProfileImages'); // folder where images will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Single multer instance for this router
const uploadSingle = multer({ storage });

// Routes
router.get('/', verifyOwnerToken, ownerProfileController.getOwnerProfile);

// Use "image" because your frontend formData key is 'image'
router.put('/', verifyOwnerToken, uploadSingle.single('image'), ownerProfileController.updateOwnerProfile);

router.delete('/', verifyOwnerToken, ownerProfileController.deleteOwnerProfile);

module.exports = router;
