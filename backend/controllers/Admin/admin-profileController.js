const Admin = require('../../Models/superAdminModel'); // Adjust if your admin model is named differently
const { hashPassword } = require('../../utils/bcryptUtil');

// Get admin profile
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
    try {
        const updates = req.body;
        if (updates.password) {
            updates.password = await hashPassword(updates.password);
        }
        const admin = await Admin.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json({ message: 'Profile updated', admin });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// Change admin password
const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        const admin = await Admin.findById(req.user.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        // Verify current password
        const isMatch = await admin.comparePassword(currentPassword); // Assuming comparePassword is in your model
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash and update new password
        admin.password = await hashPassword(newPassword);
        await admin.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};

module.exports = { getAdminProfile, updateAdminProfile, changeAdminPassword };