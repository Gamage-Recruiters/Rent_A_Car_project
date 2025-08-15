const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findOrCreateGoogleUser } = require('../controllers/Auth/customer/customer-authController');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/user/auth/google/callback`
}, 

async (accessToken, refreshToken, profile, cb) => {

    try {
        const user = await findOrCreateGoogleUser(profile);
        return cb(null, user);

    } catch (error) {
        console.log('Google login error:', error);
        return cb(error, null);
    }
}));
