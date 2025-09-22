const { model, get } = require('mongoose');
const mongoose = require('mongoose');
const Customer = require('../../Models/customerModel');
const Booking = require('../../Models/bookingModel'); 
const Favorite = require('../../Models/favoriteModel');
const fs = require('fs');
const path = require('path');

async function getProfile(req, res) {
    try {
        const custoemer = await Customer.findById(req.user.id);
        if (!custoemer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({
            success: true,
            data: custoemer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

async function updateProfile(req, res) {
    try {
        const { firstName, lastName, email, phoneNumber, dateOfBirth, driversLicense, emergencyContact, address, isNewsletterSubscribed } = req.body;

        let photoPath = null;
        if (req.file) {
            photoPath = `/uploads/customerProfiles/${req.file.filename}`;
        }

        // Get current customer
        const currentCustomer = await Customer.findById(req.user.id);
        if (!currentCustomer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) updateData.email = email;
        if (photoPath !== null) updateData.photo = photoPath;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (driversLicense !== undefined) updateData.driversLicense = driversLicense;
        if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
        if (address !== undefined) updateData.address = address;

        // Handle newsletter subscription update
        if (isNewsletterSubscribed !== undefined) {
            updateData.isNewsletterSubscribed = isNewsletterSubscribed;
            
            if (isNewsletterSubscribed && !currentCustomer.isNewsletterSubscribed) {
                // User is subscribing
                updateData.newsletterSubscribedAt = new Date();
                updateData.newsletterUnsubscribedAt = null;
            } else if (!isNewsletterSubscribed && currentCustomer.isNewsletterSubscribed) {
                // User is unsubscribing
                updateData.newsletterUnsubscribedAt = new Date();
            }
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -refreshToken -resetPasswordToken');

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedCustomer
        });
    } catch (error) {

        if(req.file) {
            const filePath = path.join(__dirname, '../../uploads/customerProfiles', req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

async function updateProfilePhoto(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const currentCustomer = await Customer.findById(req.user.id);
        if (!currentCustomer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (currentCustomer.photo) {
            const oldPhotoPath = path.join(__dirname, '../../', currentCustomer.photo);
            fs.unlink(oldPhotoPath, (err) => {
                if (err) console.error('Failed to delete old photo:', err);
            });
        }

        // Update with new photo
        const photoPath = `/uploads/customerProfiles/${req.file.filename}`;
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            { $set: { photo: photoPath } },
            { new: true }
        ).select('-password -refreshToken -resetPasswordToken');

        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully',
            data: {
                photo: updatedCustomer.photo,
                customer: updatedCustomer
            }
        });
    } catch (error) {
        if (req.file) {
            const filePath = path.join(__dirname, '../../uploads/customerProfiles/', req.file.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete uploaded file:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

async function deleteProfilePhoto(req, res) {
    try {
        const customer = await Customer.findById(req.user.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (!customer.photo) {
            return res.status(400).json({
                success: false,
                message: 'No profile photo to delete'
            });
        }

        // Delete photo file
        const photoPath = path.join(__dirname, '../../', customer.photo);
        fs.unlink(photoPath, (err) => {
            if (err) console.error('Failed to delete photo file:', err);
        });

        // Update database
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            { $unset: { photo: 1 } },
            { new: true }
        ).select('-password -refreshToken -resetPasswordToken');

        res.status(200).json({
            success: true,
            message: 'Profile photo deleted successfully',
            data: updatedCustomer
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

async function deleteProfile(req, res) {
    try {

        const customer = await Customer.findById(req.user.id);
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        // Delete profile photo if exists
        if (customer.photo) {
            const photoPath = path.join(__dirname, '../../', customer.photo);
            fs.unlink(photoPath, (err) => {
                if (err) console.error('Failed to delete photo:', err);
            });
        }

        // Clear refresh token
        await Customer.findByIdAndUpdate(req.user.id, { refreshToken: null });

        const deletedCustomer = await Customer.findByIdAndDelete(req.user.id);

         const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        };

        res.clearCookie(process.env.CUSTOMER_COOKIE_NAME, cookieOptions);
        res.clearCookie(process.env.CUSTOMER_REFRESH_COOKIE_NAME, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully',
            data: deletedCustomer
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}
async function getProfileWithStats(req, res) {
    try {
        const customerId = req.user.id;

        // Get customer profile
        const customer = await Customer.findById(customerId).select('-password -refreshToken -resetPasswordToken');
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        // Get quick stats
        const [totalBookings, totalSpent, favoriteCount, upcomingTrips] = await Promise.all([
            Booking.countDocuments({ customer: customerId }),
            Booking.aggregate([
                { $match: { customer: new mongoose.Types.ObjectId(customerId), bookingStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Favorite.countDocuments({ customer: customerId }),
            Booking.countDocuments({
                customer: customerId,
                bookingStatus: { $in: ['confirmed', 'pending'] },
                pickupDate: { $gte: new Date() }
            })
        ]);

        const profileData = {
            ...customer.toObject(),
            isGoogleUser: !!customer.googleId,
            canChangePassword: !customer.googleId && !!customer.password,
            quickStats: {
                totalBookings,
                totalSpent: totalSpent[0]?.total || 0,
                favoriteCount,
                upcomingTrips
            }
        };

        res.status(200).json({
            success: true,
            data: profileData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

module.exports = { getProfile, updateProfile, deleteProfile, updateProfilePhoto, deleteProfilePhoto, getProfileWithStats };