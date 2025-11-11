const jwt = require('jsonwebtoken');
const { verifyRefreshToken, createToken } = require('../../utils/jwtUtil');
const Customer = require('../../Models/customerModel');

/**
 * Flexible authentication middleware that handles both:
 * 1. Cookie-based authentication (for web applications)
 * 2. Bearer token authentication (for mobile applications)
 */
async function verifyCustomerFlexible(req, res, next) {
    let accessToken = null;
    let refreshToken = null;
    
    // First, try to get tokens from Authorization header (mobile app)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('Using Bearer token authentication');
    } else {
        // Fallback to cookie-based authentication (web app)
        accessToken = req.cookies[process.env.CUSTOMER_COOKIE_NAME];
        refreshToken = req.cookies[process.env.CUSTOMER_REFRESH_COOKIE_NAME];
        console.log('Using cookie-based authentication');
    }

    // If we have an access token, try to verify it
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            req.user = decoded;
            console.log('Access token verified for user:', decoded.id);
            return next();
        } catch (error) {
            console.log("Customer's access token expired or invalid. Checking refresh token.");
        }
    }

    // For mobile apps, if Bearer token is invalid, require re-authentication
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access token expired. Please log in again.'
        });
    }

    // For web apps, try refresh token
    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: 'Access Denied. Please log in.'
        });
    }

    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Please log in again.'
            });
        }

        // Check customer exists and refresh token matches with one in the db
        const customer = await Customer.findById(decoded.id);
        if (!customer || customer.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Please log in again.'
            });
        }

        // Generating a new access token
        const payload = {
            id: customer._id.toString(),
            email: customer.email,
            userRole: 'customer'
        };

        const newAccessToken = createToken(payload);
        if (!newAccessToken) {
            return res.status(500).json({
                success: false,
                message: 'Token refreshing failed.'
            });
        }

        // Set new cookie for web apps
        res.cookie(process.env.CUSTOMER_COOKIE_NAME, newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 15, // 15 minutes
        });

        // Add the user to the request
        req.user = {
            id: customer._id.toString(),
            email: customer.email,
            userRole: 'customer'
        };

        console.log("Customer access token successfully refreshed for user:", customer._id.toString());
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Token refreshing error. Please log in again.'
        });
    }
}

/**
 * Optional authentication middleware - sets user if token is valid but doesn't require authentication
 */
async function optionalCustomerAuth(req, res, next) {
    let accessToken = null;
    
    // Try to get token from Authorization header (mobile app)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
    } else {
        // Fallback to cookie-based authentication (web app)
        accessToken = req.cookies[process.env.CUSTOMER_COOKIE_NAME];
    }

    // If we have an access token, try to verify it
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            req.user = decoded;
            console.log('Optional auth: User authenticated:', decoded.id);
        } catch (error) {
            console.log("Optional auth: Token invalid, proceeding without user");
            // Don't set req.user, but continue
        }
    }

    next();
}

module.exports = {
    verifyCustomerFlexible,
    optionalCustomerAuth
};