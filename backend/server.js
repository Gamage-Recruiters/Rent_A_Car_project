const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./config/googlePassport');



const passport = require('passport');


const app = express();
const DatabaseConfig = require('./config/dbConfig');

const allowedOrigins = [
  process.env.CLIENT_URL,   
  process.env.ADMIN_URL     
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Serve static files for uploads route
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Database Connection
// uncomment this after defining the mongo uri in .env file

DatabaseConfig(process.env.dbURI);   

// Server Connection
const PORT = process.env.PORT || 5000;



// auth 
const customerAuth = require("./Routers/Auth/customer/customer-authRouter");
app.use("/api/auth/customer", customerAuth);

const ownerAuth = require("./Routers/Auth/owner/owner-authRouter");
app.use("/api/auth/owner", ownerAuth);

const superadminAuthRouter = require('./Routers/Auth/admin/admin-authRouter');
app.use("/api/auth/superadmin", superadminAuthRouter);



// Customer Routers
const profile = require('./Routers/Customer/profileRouter');
app.use('/api/customer/profile', profile);

const customerBookingRouter = require('./Routers/Customer/bookingRouter');
app.use('/api/customer/booking', customerBookingRouter);

const favoriteRouter = require('./Routers/Customer/favoriteRouter');
app.use('/api/customer/favorite', favoriteRouter);

const reviewRouter = require('./Routers/Customer/reviewRouter');
app.use('/api/customer/review', reviewRouter);

const contactRouter = require('./Routers/Customer/contactRouter');
app.use('/api/customer/contact', contactRouter);

const rentalHistoryRouter = require('./Routers/Customer/rentalHistoryRouter');
app.use('/api/customer/rental-history', rentalHistoryRouter);

const vehicleRouter = require('./Routers/Customer/vehicleRouter');
app.use('/api/customer/vehicle', vehicleRouter);

const newsletter = require('./Routers/Customer/newsLetterRouter');
app.use('/api/customer/newsletter', newsletter);

const dashboard = require('./Routers/Customer/dashboardRouter');
app.use('/api/customer/dashboard', dashboard);

// Owner Routers
const ownerVehicleRouter = require('./Routers/Owner/ownerVehicleRouter');
app.use('/api/owner/vehicle', ownerVehicleRouter)

const ownerProfileRouter = require('./Routers/Owner/ownerProfileRouter');
app.use('/api/owner/profile', ownerProfileRouter); 

const ownerBookingRouter = require('./Routers/Owner/ownerBookingRouter');
app.use('/api/owner/bookings', ownerBookingRouter);


// Super Admin Routers  ( Company Dashboard )

const adminOwnerRoutes = require('./Routers/Admin/admin-ownerRouter');
app.use('/api/superadmin', adminOwnerRoutes);

const adminVehicleRouter = require('./Routers/Admin/admin-vehicleRouter');
app.use('/api/superadmin', adminVehicleRouter);

const adminCustomerRouter = require('./Routers/Admin/admin-customerRoute');
app.use('/api/superadmin', adminCustomerRouter);

const adminProfileRouter = require('./Routers/Admin/admin-profileRouter');
app.use('/api/superadmin', adminProfileRouter);





app.get('/',(req,res) => {
        res.send("API is Working")
})




app.listen(PORT, () => {
        console.log(`server is running on PORT ${PORT}`)
})