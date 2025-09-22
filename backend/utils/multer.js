const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const vehicleImagesPath = path.join(__dirname, '../uploads/vehicles');
const customerProfileImagesPath = path.join(__dirname, '../uploads/customerProfiles');
const customerIdImagesPath = path.join(__dirname, '../uploads/customerIdImage');
const customerLicenseImagesPath = path.join(__dirname, '../uploads/customerLicenseImage');
const ownerProfileImagesPath = path.join(__dirname, '../uploads/ownerProfileImages');

// Ensure directories exist
if (!fs.existsSync(vehicleImagesPath)) {
  fs.mkdirSync(vehicleImagesPath, { recursive: true });
}
if (!fs.existsSync(customerProfileImagesPath)) {
  fs.mkdirSync(customerProfileImagesPath, { recursive: true });
}
if (!fs.existsSync(customerIdImagesPath)) {
  fs.mkdirSync(customerIdImagesPath, { recursive: true });
}
if (!fs.existsSync(customerLicenseImagesPath)) {
  fs.mkdirSync(customerLicenseImagesPath, { recursive: true }); 
}
if (!fs.existsSync(ownerProfileImagesPath)) {
  fs.mkdirSync(ownerProfileImagesPath, { recursive: true});
}

// For now configured only for vehicleImages, anyone can make necessary changes for their images accordingly
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'vehicleImages') {
      cb(null, vehicleImagesPath);
    } else if (file.fieldname === 'customerProfileImage') {
      cb(null, customerProfileImagesPath);
    } else if (file.fieldname === 'customerIdImage') {
      cb(null, customerIdImagesPath);
    } else if (file.fieldname === 'customerLicenseImage') {
      cb(null, customerLicenseImagesPath);
    } else if (file.fieldname === 'ownerProfileImage') {
      cb(null, ownerProfileImagesPath);
    } else {
      cb(new Error('Invalid file field'), false);
    }
  },
  filename: (req, file, cb) => {
    // Create unique filenames with original extension
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5mb max
  }
});

module.exports = upload;
