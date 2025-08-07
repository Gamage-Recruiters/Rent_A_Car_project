const jwt = require('jsonwebtoken');


function verifyToken(req, res, next) {
    const token = req.cookies.token ;

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No Token ! User Need to Loging First' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // add decoded user data from token to request
        req.user = decoded;

        next();

    } catch (error) {
   
        return res.status(403).json({ message: 'Server Error', error:error.message  });
    }

}
function verifyAdminToken(req, res, next) {
    const token = req.cookies.adminToken ;

    if (!token) {
        return res.status(401).json({ message: 'Access Denied.  Admin Privilages Required !' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // add decoded user data from token to request
        req.user = decoded;

        next();

    } catch (error) {
   
        return res.status(403).json({ message: 'Server Error', error:error.message  });
    }

}

module.exports = {verifyToken,verifyAdminToken};
