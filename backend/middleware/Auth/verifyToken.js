const jwt = require('jsonwebtoken');
const { verifyRefreshToken, createToken } = require('../../Utils/jwtUtil');
const Owner = require('../../Models/ownerModel');
const Customer = require('../../Models/customerModel');
const SuperAdmin = require('../../Models/superAdminModel');

async function verifySuperAdminToken(req, res, next) {

    const accessToken = req.cookies[process.env.SUPERADMIN_COOKIE_NAME];
    const refreshToken = req.cookies[process.env.SUPERADMIN_REFRESH_COOKIE_NAME];
    if (accessToken) {       
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            console.log("Super Admin's access token expired. Checking refresh token.");
        }
    }
    if (!refreshToken) {
        return res.status(401).json({
            message: 'Access Denied. Please log in.'
        });
    }


    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({
                message: 'Invalid refresh token. Please log in again.'
            });
        }
        // Check super admin exists and refresh token matches with one in the db
        const superAdmin = await SuperAdmin.findById(decoded.id);
        if (!superAdmin || superAdmin.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: 'Invalid refresh token. Please log in again.'
            });
        }
        // Generating a new access token
        const payload = {
            id: superAdmin._id.toString(),
            email: superAdmin.email,
            userRole: superAdmin.userRole
        };

        const newAccessToken = createToken(payload);
        if (!newAccessToken) {
            return res.status(500).json({
                message: 'Token refreshing failed.'
            });
        }

        res.cookie(process.env.SUPERADMIN_COOKIE_NAME, newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 15, // 15 minutes
        });

        req.user = {
            id: superAdmin._id.toString(),
            email: superAdmin.email,
            userRole: superAdmin.userRole
        };

        console.log("Super Admin access token successfully refreshed.");
        next();


    } catch (error) {
   
       return res.status(401).json({
            message: 'Token refreshing error. Please log in again.'
        });
    }

}

async function verifyCustomerToken(req, res, next) {
    const accessToken = req.cookies[process.env.CUSTOMER_COOKIE_NAME];
    const refreshToken = req.cookies[process.env.CUSTOMER_REFRESH_COOKIE_NAME];

    if (accessToken) {
        try{
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            // if access token invalid
            console.log("Customer's access token expired. Checking refresh token.");
        }
    } 

    if (!refreshToken) {
        return res.status(401).json({
            message: 'Access Denied. Please Log in.'
        });
    }

    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({
                message: 'Invalid refresh token. Please log in again.'
            });
        }

        // Check customer exists and refresh token matches with one in the db
        const customer = await Customer.findById(decoded.id);
        if (!customer || customer.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: 'Invalid refresh token. Please log in again.'
            });
        }

        // Generating a new access token
        const payload = {
            id: customer._id.toString(),
            email: customer.email,
            userRole: 'customer'
        }

        const newAccessToken = createToken(payload);
        if (!newAccessToken) {
            return res.status(500).json({
                message: 'Token refreshing failed.'
            });
        }

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
        }

        console.log("Customer Access token successfully refreshed.")
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token refreshing error. Please log in again.'
        })
    }
}

async function verifyOwnerToken(req, res, next) {
    const accessToken = req.cookies[process.env.OWNER_COOKIE_NAME];
    const refreshToken = req.cookies[process.env.OWNER_REFRESH_COOKIE_NAME];

    if (accessToken) {
        try{
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (error) {
            // if access token invalid
            console.log("Owner's access token expired. Checking refresh token.");
        }
    } 

    if (!refreshToken) {
        return res.status(401).json({
            message: 'Access Denied. Please Log in.'
        });
    }

    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({
                message: 'Invalid refresh token. Please log in again.'
            });
        }

        // Check owner exists and refresh token matches with one in the db
        const owner = await Owner.findById(decoded.id);
        if (!owner || owner.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: 'Invalid refresh token. Please log in again.'
            });
        }

        // Generating a new access token
        const payload = {
            id: owner._id.toString(),
            email: owner.email,
            userRole: 'owner'
        }

        const newAccessToken = createToken(payload);
        if (!newAccessToken) {
            return res.status(500).json({
                message: 'Token refreshing failed.'
            });
        }

        res.cookie(process.env.OWNER_COOKIE_NAME, newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 15, // 15 minutes
        });

        // Add the user to the request
        req.user = {
            id: owner._id.toString(),
            email: owner.email,
            userRole: 'owner'
        }

        console.log("Owner Access token successfully refreshed.")
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token refreshing error. Please log in again.'
        })
    }
}

module.exports = {  verifySuperAdminToken, verifyOwnerToken, verifyCustomerToken };