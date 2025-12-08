const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { getOwnerProfile, updateOwnerProfile, deleteOwnerProfile } = require('../../controllers/Owner/ownerProfileController');
const { verifyOwnerToken } = require('../../middleware/Auth/verifyToken');

// ✅ Ensure upload folder exists
const uploadDir = path.join(__dirname, '../../uploads/ownerProfileImages');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `owner_${req.user.id}${ext}`);
    },
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// ✅ Routes
router.get('/', verifyOwnerToken, getOwnerProfile);
router.put('/', verifyOwnerToken, upload.single('image'), updateOwnerProfile);
router.delete('/', verifyOwnerToken, deleteOwnerProfile);

module.exports = router;