const path = require('path');

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded.'
      });
    }

    // ✅ Build the local path (relative path for frontend and DB)
    const relativeFilePath = path.join(
      '/uploads/vehicles',
      path.basename(req.file.path)
    );

    // ✅ Return the local file URL instead of Cloudinary URL
    return res.status(200).json({
      message: 'Image uploaded successfully.',
      imageUrl: relativeFilePath // 👈 /uploads/vehicles/vehicleImages-xxxxxx.png
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      message: 'Failed to upload image',
      error: error.message
    });
  }
}

module.exports = { uploadImage };
