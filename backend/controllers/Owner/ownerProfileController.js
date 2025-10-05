const Owner = require("../../Models/ownerModel");
const fs = require('fs');
const path = require('path');

async function getOwnerProfile(req, res) {
    try {
        const ownerId = req.user.id;
        const owner = await Owner.findById(ownerId, { password: 0, refreshToken: 0 });
        
        if (!owner) {
            return res.status(404).json({
                message: 'Owner not found for the id.'
            });
        }

        return res.status(200).json({
            message: 'Owner Found',
            data: owner
        });
    } catch (error) {
        console.error('Error fetching owner profile:', error);
        return res.status(500).json({
            message: 'Server Error while fetching owner profile',
            error: error.message
        });
    }
}

// ✅ FIXED: Update Owner Profile with all fields
async function updateOwnerProfile(req, res) {
    try {
        const ownerId = req.user.id;
        const { firstName, lastName, username, email, phone, address } = req.body;
        
        const owner = await Owner.findById(ownerId);
        if (!owner) {
            return res.status(404).json({ message: "Owner not found" });
        }

        // Update basic fields
        if (firstName) owner.firstName = firstName;
        if (lastName) owner.lastName = lastName;
        if (username) owner.username = username;
        if (email) owner.email = email;
        if (phone) owner.phone = phone;
        if (address) owner.address = address;

        // Handle image upload if file exists
        if (req.file) {
            // Delete old profile image if exists
            if (owner.image) {
                const oldImagePath = path.join(__dirname, '../../uploads/ownerProfileImages', owner.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            // Save new image filename
            owner.image = req.file.filename;
        }

        await owner.save();

        // Return updated owner data (excluding sensitive fields)
        const updatedOwner = await Owner.findById(ownerId, { password: 0, refreshToken: 0 });

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedOwner
        });

    } catch (err) {
        console.error('Error updating owner profile:', err);
        res.status(500).json({ 
            success: false, 
            message: "Error updating profile",
            error: err.message 
        });
    }
}

async function deleteOwnerProfile(req, res) {
    try {
        const ownerId = req.user.id;
        const owner = await Owner.findById(ownerId);
        
        if (!owner) {
            return res.status(404).json({
                message: 'Owner not found'
            });
        }

        // Delete profile image if exists
        if (owner.image) {
            try {
                const imagePath = path.join(__dirname, '../../uploads/ownerProfileImages', owner.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`Deleted owner image: ${imagePath}`);
                }
            } catch (error) {
                console.error('Error deleting owner profile image:', error);
            }
        }

        await Owner.findByIdAndDelete(ownerId);

        return res.status(200).json({
            message: 'Owner profile successfully deleted.'
        });

    } catch (error) {
        console.error('Error deleting owner profile:', error);
        return res.status(500).json({
            message: 'Failed to delete owner profile.',
            error: error.message
        });
    }
}

module.exports = {
    getOwnerProfile,
    updateOwnerProfile,
    deleteOwnerProfile
};