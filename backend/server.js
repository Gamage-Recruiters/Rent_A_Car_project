const express = require('express');
const cors = require('cors');
require('dotenv').config();

// require('./config/googlePassport');



const passport = require('passport');
const cookieParser = require('cookie-parser');

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

//Database Connection
// uncomment this after defining the mongo uri in .env file

// DatabaseConfig(process.env.dbURI);   


// Server Connection
const PORT = process.env.PORT || 5000;



// auth 
const customerAuth = require("./Routers/Auth/customer/admin-authRouter");
app.use("/api/auth/customer", customerAuth);





// Customer Routers







// Owner Routers

// const ownerContactUs = require("./Routers/Contact/admin/adminContactRouter");
// app.use("/api/admin/contactus", ownerContactUs);



// Super Admin Routers  ( Company Dashboard )

// const superAdminContactUs = require("./Routers/Contact/admin/adminContactRouter");
// app.use("/api/admin/contactus", superAdminContactUs);




app.get('/',(req,res) => {
        res.send("API is Working")
})




app.listen(PORT, () => {
        console.log(`server is running on PORT ${PORT}`)
})