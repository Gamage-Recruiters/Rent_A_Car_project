const jwt = require('jsonwebtoken');


function createToken(userData) {

    const expTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour ...

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

module.exports = { createToken, verifyToken };
