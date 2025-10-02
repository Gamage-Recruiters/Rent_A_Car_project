const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
require('./config/googlePassport');

const DatabaseConfig = require('./config/dbConfig');

const app = express();

// ============================
// ✅ Middleware
// ============================
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ✅ Serve static files (profile images, etc.)

// Serve static files for vehicle images
app.use('/uploads/ownerProfileImages', express.static(path.join(__dirname, 'uploads/ownerProfileImages')));
app.use('/uploads/vehicles', express.static(path.join(__dirname, 'uploads/vehicles')));
app.use('/uploads/customerProfiles', express.static(path.join(__dirname, 'uploads/customerProfiles')));
app.use('/uploads/customerIdImage', express.static(path.join(__dirname, 'uploads/customerIdImage')));
app.use('/uploads/customerLicenseImage', express.static(path.join(__dirname, 'uploads/customerLicenseImage')));
// ============================
// ✅ Database Connection
// ============================
DatabaseConfig(process.env.dbURI);

// ============================
// ✅ Routes
// ============================

// 🔹 Auth
app.use("/api/auth/customer", require("./Routers/Auth/customer/customer-authRouter"));
app.use("/api/auth/owner", require("./Routers/Auth/owner/owner-authRouter"));
app.use("/api/auth/superadmin", require("./Routers/Auth/admin/admin-authRouter"));

// 🔹 Customer
app.use("/api/customer/profile", require("./Routers/Customer/profileRouter"));
app.use("/api/customer/booking", require("./Routers/Customer/bookingRouter"));
app.use("/api/customer/favorite", require("./Routers/Customer/favoriteRouter"));
app.use("/api/customer/review", require("./Routers/Customer/reviewRouter"));
app.use("/api/customer/contact", require("./Routers/Customer/contactRouter"));
app.use("/api/customer/rental-history", require("./Routers/Customer/rentalHistoryRouter"));
app.use("/api/customer/vehicle", require("./Routers/Customer/vehicleRouter"));
app.use("/api/customer/newsletter", require("./Routers/Customer/newsLetterRouter"));
app.use("/api/customer/dashboard", require("./Routers/Customer/dashboardRouter"));

// 🔹 Owner
app.use("/api/owner/vehicle", require("./Routers/Owner/ownerVehicleRouter"));
app.use("/api/owner/profile", require("./Routers/Owner/ownerProfileRouter"));
app.use("/api/owner/bookings", require("./Routers/Owner/ownerBookingRouter"));

// 🔹 Super Admin (Company Dashboard)
app.use("/api/superadmin", require("./Routers/Admin/admin-ownerRouter"));
app.use("/api/superadmin", require("./Routers/Admin/admin-vehicleRouter"));
app.use("/api/superadmin", require("./Routers/Admin/admin-customerRoute"));
app.use("/api/superadmin", require("./Routers/Admin/admin-profileRouter"));

// 🔹 Cloudinary
app.use("/api/cloudinary", require("./Routers/Cloudinary/imageUploadRouter"));

// ============================
// ✅ Health Check
// ============================
app.get('/', (req, res) => {
  res.send("🚀 API is Working");
});

// ============================
// ✅ Error Handling Middleware
// ============================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ============================
// ✅ Start Server
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
});
