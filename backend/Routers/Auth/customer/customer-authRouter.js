const router = require('express').Router();
const passport = require('passport');
const customerAuthController = require('../../../controllers/Auth/customer/customer-authController');
const { verifyCustomerToken } = require('../../../middleware/Auth/verifyToken');

// Public routes
router.route('/register').post(customerAuthController.addUser);
router.route('/login').post(customerAuthController.loginUser);

// Password reset routes
router.route('/forgot-password').post(customerAuthController.requestPasswordReset);
router.route('/reset-password').post(customerAuthController.resetPassword);


// Protected routes
router.route('/logout').post(verifyCustomerToken, customerAuthController.logoutUser);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    customerAuthController.googleLoginUser
);



module.exports = router