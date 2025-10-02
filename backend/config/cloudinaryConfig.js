const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dzb6vdgiu', 
  api_key: '121142137997774', 
  api_secret: 'k7TQOg6y-LeylP5KHTs539U52Os' 
});

module.exports = cloudinary;
