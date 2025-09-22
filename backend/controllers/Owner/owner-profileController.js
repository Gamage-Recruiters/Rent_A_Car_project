const Owner = require("../../Models/ownerModel");
const { hashPassword } = require("../../utils/bcryptUtil");
const fs = require('fs');
const path = require('path');

async function getOwnerProfile(req, res) {
    try{
        const ownerId = req.user.id;

        const owner = await Owner.findById(ownerId, {password: 0, refreshToken: 0});
        if (!owner) {
            return res.status(404).json({
                message: 'Owner not found for the id.'
            });
        }

        return res.status(200).json({
            message: 'Owner Found',
            data: owner
        });
    } catch(error) {
        console.error('Error fetching owner profile:', error);
        return res.status(500).json({
            message: 'Server Error while fetching owner profile',
            error: error.message
        })
    }
}

async function updateOwnerProfile(req, res) {
    try{
        const ownerId = req.user.id;
        
        // Check if owner exists
        const owner = await Owner.findById(ownerId, {password: 0, refreshToken: 0});
        if(!owner) {
            return res.status(404).json({
                message: 'Owner not found'
            });
        }

        // Create update object with only provided fields
        const updateData = {};
        const {email, password, firstName, lastName} = req.body;

        if (email) updateData.email = email;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;

        if (password) {
            updateData.hashedPassword = await hashPassword(password);
        }

        if (req.file) {
            // Delete old image if it exists
            if (owner.image) {
                try{
                    const oldImagePath = path.join(
                        __dirname, 
                        '../../', 
                        owner.image.replace(/^\//, '') // Remove leading slash (I have added a complete breakdown on this regex in bottom.) * 
                    ); 
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                        console.log(`Deleted owner's old profile image: ${oldImagePath}`);
                    }
                } catch(error) {
                    console.error('Error deleting old profile image:', error);
                }
            }
            updateData.image = `/uploads/ownerProfileImages/${req.file.filename}`;
        }

        await Owner.updateOne(
            {_id: ownerId},
            {$set: updateData}
        )

        return res.status(200).json({
            message: 'Owner profile updated successfully.'
        })
    } catch (error) {
        console.error('Error updating owner profile:', error);
        return res.status(500).json({
            message: 'Failed to update owner profile.',
            error: error.message
        });
    }
}

async function deleteOwnerProfile(req, res) {
    try{
        const ownerId = req.user.id;

        // Check if owner exists
        const owner = await Owner.findById(ownerId);
        if(!owner) {
            return res.status(404).json({
                message: 'Owner not found'
            });
        }

        if (owner.image) {
            try {
                const imagePath = path.join(
                    __dirname,
                    '../../',
                    owner.image.replace(/^\//, '') 
                );
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`Deleted owner image: ${imagePath}`)
                }
            } catch (error) {
                console.error('Error deleting owner\'s profile image:', error);
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
}

/* 

"/^\//" - REGEX BREAKDOWN

/: This is the delimiter that marks the beginning and end of the regular expression pattern.

^: This is an anchor that asserts the position at the start of the string. It ensures that the pattern that follows must be found at the very beginning.

\: This is an escape character. The forward slash (/) is a special character in regex (because it's used as the delimiter), so it needs to be "escaped" with a backslash to be treated as a literal forward slash.

/: This is the literal character being matched—a forward slash.

*/ 