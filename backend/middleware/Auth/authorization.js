


function isAnyAdmin(req, res, next) {
    const userRole = req.user.userRole;
    try {

        if (userRole != 'owner' && userRole != 'super-admin') {
            return res.status(403).json({ message: 'Access denied. Admin or Owner privileges required.' });
        }

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Server Error' , error:error.message });
    }

}

function isSuperAdmin(req, res, next) {

   

    const userRole = req.user?.userRole;
 
    try {

        if (userRole != 'super-admin') {
            return res.status(403).json({ message: 'Access denied. Super Admin privileges required.' });
        }

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Server Error' , error:error.message });
    }

}

function isSuperAdminUser(user) {
  return user?.userRole === 'super-admin';
}



function isAdmin(req, res, next) {
    const userRole = req.user.userRole;

    try {

        if (userRole != 'admin' ) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Server Error' , error:error.message });
    }

}

module.exports = {isAnyAdmin,isSuperAdmin,isSuperAdminUser,isAdmin}
