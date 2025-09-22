const jwt = require('jsonwebtoken');

// access token
function createToken(userData) {

    const expTime = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes ...

    try {
        // generate a new token ...
        const newToken = jwt.sign({
            id: userData.id,
            email: userData.email || 'no email',
            userRole: userData.userRole || 'user',
            exp: expTime,
        }, process.env.JWT_SECRET);

        return newToken;

    } catch (error) {
        console.log(error)

    }

}

// refresh token
function createRefreshToken(userData) {
    const expTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

    try {
        const refreshToken = jwt.sign({
            id: userData.id,
            email: userData.email || 'no email',
            userRole: userData.userRole || 'user',
            type: 'refresh',
            exp: expTime,
        }, process.env.JWT_REFRESH_SECRET);
        return refreshToken;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        return decoded;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No Token found' });
    }

    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }

}

// Create password reset token
function createResetToken(userId) {
    const expTime = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour

    try {
        const resetToken = jwt.sign({
            id: userId,
            type: 'password_reset',
            exp: expTime,
        }, process.env.RESET_TOKEN_SECRET);
        return resetToken;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function verifyResetToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
        return decoded;
    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = { createToken, createRefreshToken, verifyRefreshToken, verifyToken, createResetToken, verifyResetToken };
