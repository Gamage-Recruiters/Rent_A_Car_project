const User = require('../../../Models/superAdminModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { hashPassword, checkPassword } = require('../../../utils/bcryptUtil');
const { createToken,createRefreshToken } = require('../../../utils/jwtUtil');
const { isSuperAdmin ,isSuperAdminUser } = require('../../../middleware/Auth/authorization');

// helper: non-blocking logger
async function logActivity({ action, user = 'system', type = 'general', meta = {} } = {}) {
  try {
    await Activity.create({ action, user, type, meta });
  } catch (err) {
    console.error('logActivity error:', err && err.message);
  }
}

// controller: fetch recent activities
async function getRecentActivities(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activities', error: err.message });
  }
}


// Login Super Admin
async function loginSuperAdmin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email or Password cannot be empty" });
    }

    try {
        const existUser = await User.findOne({ email});//, userRole: 'super-admin' });
        if (!existUser || !isSuperAdminUser(existUser) ) {
            return res.status(400).json({ message: "Invalid Email or Not a Super Admin" });
        }

        const isPassMatch = await checkPassword(password, existUser.password);
        if (!isPassMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const payload = {
            id: existUser._id.toString(),
            email: existUser.email,
            userRole: existUser.userRole,
        };

        const accessToken = createToken(payload);
        const refreshToken = createRefreshToken(payload);

        try { logActivity({ action: 'Super admin login', user: existUser.email, type: 'auth', meta: { ip: req.ip } }); } catch (e) {}

        res
            .cookie(process.env.SUPERADMIN_COOKIE_NAME, accessToken, { httpOnly: true })
            .cookie(process.env.SUPERADMIN_REFRESH_COOKIE_NAME, refreshToken, { httpOnly: true })
            .status(200)
            .json({
                message: "Super Admin Login Successful",
                userRole: existUser.userRole,
                accessToken,
                refreshToken
            });

    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

// Create admin (only logged-in superadmin)
async function createAdminBySuperAdmin(req, res) {
    try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password || !firstName) return res.status(400).json({ message: 'Missing fields' });

        const exist = await User.findOne({ email });
        if (exist) return res.status(409).json({ message: 'Admin with this email already exists' });

        const hashed = await hashPassword(password);
        const newAdmin = await User.create({
            email,
            password: hashed,
            firstName,
            lastName,
            userRole: 'super-admin',
            status: 'approved'
        });

        res.status(201).json({ message: 'Admin created', adminId: newAdmin._id });
    } catch (err) {
        res.status(500).json({ message: 'Error creating admin', error: err.message });
    }
}

async function getAllAdmins(req, res) {
    try {
        const admins = await User.find({ userRole: 'super-admin' }).select('-password -resetPasswordToken -resetPasswordExpires');
        res.status(200).json(admins);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching admins', error: err.message });
    }
}

async function getAdminById(req, res) {
    try {
        const admin = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching admin', error: err.message });
    }
}

async function deleteAdmin(req, res) {
    try {
        const targetId = req.params.id;
        if (req.user && req.user.id === targetId) {
            return res.status(400).json({ message: 'Cannot delete currently logged-in admin' });
        }
        const admin = await User.findByIdAndDelete(targetId);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        // log admin deletion (non-blocking)
       try {
         logActivity({ action: 'Admin deleted', user: req.user?.email || 'system', type: 'admin', meta: { deletedAdminId: targetId, deletedAdminEmail: admin.email } });
       } catch (e) {}

        res.status(200).json({ message: 'Admin deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting admin', error: err.message });
    }
}


// Logout Super Admin
async function logoutSuperAdmin(req, res) {
     try { logActivity({ action: 'Super admin logout', user: req.user?.email || 'unknown', type: 'auth', meta: { ip: req.ip } }); } catch (e) {}
    res.clearCookie(process.env.SUPERADMIN_COOKIE_NAME, {   // ✅ unified cookie name
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    return res.status(200).json({ message: 'Super Admin logout successful' });
}

//forgotten password

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const admin = await User.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        admin.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
        await admin.save();

        // Send email
        const resetUrl = `http://localhost:5173/admin/reset-password/${resetToken}`;
        const message = `You requested a password reset. Click the link to reset your password: ${resetUrl}`;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.APP_EMAIL,
                pass: process.env.APP_PASSWORD
            },
        });

        await transporter.sendMail({
            to: admin.email,
            subject: 'Password Reset Request',
            text: message,
        });

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting password reset', error: error.message });
    }
};

async function getProfile(req, res) {
  try {
    const id = req.user?.id || req.user?._id;
    if (!id) return res.status(401).json({ message: 'Unauthenticated' });

    const admin = await User.findById(id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.status(200).json({
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      userRole: admin.userRole,
      status: admin.status,
      createdAt: admin.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        console.log('Token from URL:', token);
       console.log('New password:', newPassword);


        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const admin = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
        });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Reset password
        admin.password = await hashPassword(newPassword);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

async function createInitialAdmin(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Only allow if no super-admin exists yet
    const existingCount = await User.countDocuments({ userRole: 'super-admin' });
    if (existingCount > 0) {
      return res.status(403).json({ message: 'Initial super-admin already created' });
    }

    const hashed = await hashPassword(password);
    const newAdmin = await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
      userRole: 'super-admin',
      status: 'approved'
    });

    return res.status(201).json({ message: 'Initial super-admin created', adminId: newAdmin._id });
  } catch (err) {
    return res.status(500).json({ message: 'Error creating initial admin', error: err.message });
  }
}

module.exports = { loginSuperAdmin, logoutSuperAdmin, requestPasswordReset, resetPassword, createAdminBySuperAdmin, getAllAdmins, getAdminById, deleteAdmin, createInitialAdmin,getProfile, getRecentActivities, logActivity };
