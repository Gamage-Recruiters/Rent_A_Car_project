const express = require('express');
const router = express.Router();

const { addSuperAdmin, loginSuperAdmin, logoutSuperAdmin,requestPasswordReset, resetPassword,createAdminBySuperAdmin,getAllAdmins,getAdminById,deleteAdmin } = require('../../../controllers/Auth/admin/admin-authController');
const {verifySuperAdminToken} = require('../../../middleware/Auth/verifyToken');
const {isSuperAdmin}  = require('../../../middleware/Auth/authorization');
const { verifyRefreshToken, createAccessToken } = require('../../../utils/jwtUtil');
// Route to add new Super Admin (protected by secret key)


// Super Admin login
router.post('/login', loginSuperAdmin);

// Route for requesting password reset
router.post('/forgot-password', requestPasswordReset);

// Route for resetting password
router.put('/reset-password/:token', resetPassword);


router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies[process.env.SUPERADMIN_REFRESH_COOKIE_NAME] || req.cookies.superadminrefreshtoken;
     if (!refreshToken) return res.status(401).json({ message: "No Refresh Token" });

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const newAccessToken = createAccessToken({
            id: decoded.id,
            email: decoded.email,
            userRole: decoded.userRole
        });
         res.cookie(process.env.SUPERADMIN_COOKIE_NAME || 'superadmintoken', newAccessToken, { httpOnly: true });
        res.json({ message: "Access token refreshed" });
    } catch (err) {
        res.status(403).json({ message: "Invalid Refresh Token" });
    }
});

// Super Admin logout
router.post('/logout', logoutSuperAdmin);

// Protected admin-management routes (only for logged-in superadmin)
+router.post('/admins', verifySuperAdminToken, isSuperAdmin, createAdminBySuperAdmin);
+router.get('/admins', verifySuperAdminToken, isSuperAdmin, getAllAdmins);
+router.get('/admins/:id', verifySuperAdminToken, isSuperAdmin, getAdminById);
+router.delete('/admins/:id', verifySuperAdminToken, isSuperAdmin, deleteAdmin);

//Protected Super Admin route 
router.get('/owners/pending', verifySuperAdminToken, isSuperAdmin, (req, res) => {
    res.json({ message: 'Only Super Admin can access this route' });
});

module.exports = router;
