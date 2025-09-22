const fs = require('fs');
const path = require('path');
const Vehicle = require("../../Models/vehicleModel");
const { error } = require('console');
const { findByIdAndUpdate } = require('../../Models/customerModel');

async function registerVehicle(req, res) {
    try {
        const {vehicleName, vehicleLicenseNumber, brand, model, year, vehicleType, description, noSeats, fuelType, transmission, mileage, isDriverAvailable, pricePerDay, pricePerDistance, location, phoneNumber, email, pickupAddress} = req.body;

        if (!vehicleName || !vehicleLicenseNumber || !brand || !model || !year || !vehicleType || !noSeats || !fuelType || !transmission || !pricePerDay || !pricePerDistance || !phoneNumber || !pickupAddress) {
            return res.status(400).json({
                message: 'All the required fields must be filled.'
            });
        }

        // Check if vehicle with the same license number already exists
        const existingVehicle = await Vehicle.findOne({ vehicleLicenseNumber });
        if (existingVehicle) {
            return res.status(409).json({
                message: 'A vehicle with the same license number already exists.'
            });
        }

        // Onwer id
        const ownerId = req?.user.id;
        files = req.files || []
        const imagePaths = files.map(file => `/uploads/vehicles/${file.filename}`);

        await Vehicle.create({
            vehicleName, 
            vehicleLicenseNumber, 
            brand, 
            model, 
            year, 
            vehicleType, 
            description, 
            noSeats, 
            fuelType, 
            transmission, 
            mileage, 
            isDriverAvailable, 
            pricePerDay, 
            pricePerDistance, 
            location, 
            phoneNumber, 
            email, 
            pickupAddress,
            images: imagePaths,
            owner: ownerId //owner reference
        });

        return res.status(201).json({
            message: 'Vehicle Created Successfully! Pending Approval.'
        })

    } catch(error) {
        console.error('Error registering vehicle:', error);
        // further checking for duplicates from db level
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'A vehicle with this license number already exists.'
            })
        }
        return res.status(500).json({
            message: 'Failed to register vehicle',
            error: error.message
        })
    }
}

async function getVehicle(req, res) {
    try{
        const vehicleId = req.params.id;
        const ownerId = req.user.id;

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: 'No vehicle found.'
            });
        }

        // Check vehicle belongs to the logged in user
        if (vehicle.owner.toString() !== ownerId){
            return res.status(403).json({
                message: 'You don\'t have permission for others\' vehicles.'
            });
        }

        return res.status(200).json({
            message: 'Vehicle returned successfully.',
            data: vehicle
        });
    } catch (error) {
        console.error('Error getting vehicle:', error);
        return res.status(500).json({
            message: 'Failed to get vehicle',
            error: error.message
        });
    }
}

async function getAllVehiclesByOwnerId(req, res) {
    try {
        const ownerId = req.user.id;

        const ownersVehicles = await Vehicle.find({ owner: ownerId });

        return res.status(200).json({
            message: 'All the vehicles for the owner returned as a list.',
            data: ownersVehicles
        })
    } catch (error) {
        console.error('Error getting vehicles for the owner: ', error);
        return res.status(500).json({
            message: 'Failed to get the vehicles',
            error: error.message
        });
    }
}

async function getAvailability(req, res) {
    try {
        const vehicleId = req.params.id;
        const ownerId = req.user.id;

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId, { unavailableDates: 1, owner: 1 });

        if (!vehicle) {
            return res.status(404).json({
                message: 'No vehicle found.'
            });
        }

        // Check vehicle belongs to the logged in user
        if (vehicle.owner.toString() !== ownerId){
            return res.status(403).json({
                message: 'You don\'t have permission for others\' vehicles.'
            });
        }

        return res.status(200).json({
            message: 'Vehicle unavailable dates received.',
            unavailableDates: vehicle.unavailableDates
        })
    } catch (error) {
        console.log('Error getting unavailable date for the vehicle.', error);
        return res.status(500).json({
            message: 'Failed to get the vehicle availability.',
            error: error.message
        });
    }
}

async function updateVehicle(req, res) {
    try {
        const vehicleId = req.params.id;
        const ownerId = req.user.id;

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: 'No vehicle found.'
            });
        }

        // Check vehicle belongs to the logged in user
        if (vehicle.owner.toString() !== ownerId){
            return res.status(403).json({
                message: 'You don\'t have permission to update others\' vehicles.'
            });
        }

        if (!vehicle.isApproved) {
            return res.status(403).json({
                message: 'Your vehicle registration is still pending for approval.'
            })
        }

        const {vehicleName, brand, model, year, vehicleType, description, noSeats, fuelType, transmission, mileage, isDriverAvailable, pricePerDay, pricePerDistance, location, phoneNumber, email, pickupAddress} = req.body;

        const files = req.files || [];
        const newImagePaths = files.map(file => `/uploads/vehicles/${file.filename}`);

        let updatedImages = vehicle.images || [];
        if (newImagePaths.length > 0) {
            updatedImages = [...updatedImages, ...newImagePaths];
        }

        await Vehicle.updateOne( 
            {_id: vehicleId}, 
            {$set: {
                vehicleName, brand, model, year, vehicleType, description, noSeats, fuelType, transmission, mileage, isDriverAvailable, pricePerDay, pricePerDistance, location, phoneNumber, email, pickupAddress,
                images: updatedImages
            }}
        );
        return res.status(200).json({
            message: 'Vehicle updated successfully.'
        })
    } catch (error) {
        console.error('Error updating vehicle:', error);
        return res.status(500).json({
            message: 'Failed to update vehicle',
            error: error.message
        });
    }
}

// DATE FORMAT: YYYY-MM-DD
async function blockDates(req, res) {
    try {
        const vehicleId = req.params.id;
        const ownerId = req.user.id;

        const {startDate, endDate, reason} = req.body;

        // Required fields
        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Start date and end date are required.'
            })
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate date format
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: 'Invalid date format. Please provide valid dates.'
            });
        }

        if (start > end) {
            return res.status(400).json({
                message: 'Start date must be before end date.'
            });
        }
        
        // Check for old dates
        const today = new Date();
        today.setHours(0, 0, 0, 0); //Start of the day

        if (start < today) {
            return res.status(400).json({
                message: 'Cannot block dates in the past.'
            });
        }

        // Validate reason
        if (reason && reason !== 'booked' && reason !== 'maintenance' && reason !== 'owner_blocked') {
            return res.status(400).json({
                message: 'Invalid reason. Must be one of: booked, maintenance, owner_blocked'
            });
        }

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: 'No vehicle found.'
            });
        }

        // Check vehicle belongs to the logged in user
        if (vehicle.owner.toString() !== ownerId){
            return res.status(403).json({
                message: 'You don\'t have permission to block dates of others\' vehicles.'
            });
        }

        // Check if vehicle is approved
        if (!vehicle.isApproved) {
            return res.status(403).json({
                message: 'Your vehicle registration is still pending for approval.'
            });
        }

        // Check for confilicts with existing unavailable dates
        const hasConflict = vehicle.unavailableDates.some(dateRange => {
            const existingStart = new Date(dateRange.startDate);
            const existingEnd = new Date(dateRange.endDate);

            return (start < existingEnd && end > existingStart);
        });

        if (hasConflict) {
            return res.status(409).json({
                message: 'Date range conflicts with existing unavailable dates.'
            });
        }

        await Vehicle.findByIdAndUpdate(
            vehicleId,
            {
                $push: {
                    unavailableDates: {
                        startDate: start,
                        endDate: end,
                        reason: reason || 'owner_blocked'
                    }
                }
            }
        )

        return res.status(200).json({
            message: 'Dates blocked successfully.',
            blockedPeriod: {
                startDate: start,
                endDate: end,
                reason: reason || 'owner_blocked'
            }
        });
    } catch (error) {
        console.log('Error blocking dates for a vehicle.');
        return res.status(500).json({
            message: 'Server error.',
            error: error.message
        });
    }
}

async function unblockDates(req, res) {
    try{
        const vehicleId = req.params.id;
        const ownerId = req.user.id;

        const {startDate, endDate} = req.body;

        // Required fields
        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Start date and end date are required.'
            })
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate date format
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: 'Invalid date format. Please provide valid dates.'
            });
        }    

        if (start > end) {
            return res.status(400).json({
                message: 'Start date must be before end date.'
            });
        }

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: 'No vehicle found.'
            });
        }

        // Check vehicle belongs to the logged in user
        if (vehicle.owner.toString() !== ownerId){
            return res.status(403).json({
                message: 'You don\'t have permission to unblock dates of others\' vehicles.'
            });
        }

        // Check whether the date range exists
        const dateRangeExists = vehicle.unavailableDates.some(dateRange => 
            dateRange.startDate.getTime() === start.getTime() &&
            dateRange.endDate.getTime() === end.getTime()
        );

        if (!dateRangeExists) {
            return res.status(404).json({
                message: 'No matching date range found to unblcok.'
            });
        }

        await Vehicle.findByIdAndUpdate(
            vehicleId,
            {
                $pull: {
                    unavailableDates: {
                        startDate: start,
                        endDate: end,
                    }
                }
            }
        );

        return res.status(200).json({
            message: 'The given dates unblocked successfully.'
        });

    } catch (error) {
        console.log('Error unblocking dates for a vehicle.', error);
        return res.status(500).json({
            message: 'Server error.',
            error: error.message
        });
    }
}

async function deleteVehicle(req, res) {
    try {
        const vehicleId = req.params.id;
        const ownerId = req.user.id;

        // Check if vehicle exists
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: 'No vehicle found'
            });
        }

        // Check vehicle belongs to the logged in user
        if (vehicle.owner.toString() !== ownerId){
            return res.status(403).json({
                message: 'You don\'t have permission to delete others\' vehicles.'
            });
        }
        
        // Delete related images from the server
        if (vehicle.images && vehicle.images.length > 0) {
            vehicle.images.forEach(imagePath => {
                // convert relative path to absolute path
                // Remove leading slash from the path if it exists
                const relativePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
                const absolutePath = path.join(__dirname, '../../', relativePath);
                            
                fs.unlink(absolutePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete image: ${absolutePath}`, err);
                    }
                });
            });
        }
        await Vehicle.findByIdAndDelete(vehicleId)

        return res.status(200).json({
            message: 'Vehicle successfully deleted.'
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        return res.status(500).json({
            message: 'Failed to delete vehicle',
            error: error.message
        });
    }
}

// To delete a specifc vehicle image
async function deleteVehicleImage(req, res) {
    try{
        const vehicleId = req.params.id;
        const imageId = parseInt(req.params.imageId);
        const ownerId = req.user.id;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                message: 'No vehicle found.'
            });
        }

        if (vehicle.owner.toString() !== ownerId){
            return res.status(403).json({
                message: 'You don\'t have permission to delete images from others\' vehicles.'
            });
        }

        // Check if imageId is valid
        if (imageId >= vehicle.images.length || imageId < 0) {
            return res.status(404).json({
                message: 'Invalid image index.'
            })
        }

        const imageToDelete = vehicle.images[imageId];

        // Delete the image from file system
        if (imageToDelete) {
            const relativePath = imageToDelete.startsWith('/') ? imageToDelete.substring(1) : imageToDelete;
            const absolutePath = path.join(__dirname, '../../', relativePath);

            fs.unlink(absolutePath, (err) => {
                if(err) {
                    console.error(`Failed to delete image: ${absolutePath}`, err);
                }
            });
        }

        // Remove the image from the images array
        const updatedImages = [...vehicle.images];
        updatedImages.splice(imageId, 1);

        await Vehicle.updateOne(
            {_id: vehicleId},
            {$set: {
                images: updatedImages
            }}
        );

        return res.status(200).json({
            message: 'Image deleted successfully',
            remainingImages: updatedImages
        });
    } catch(err) {
        console.error('Error deleting vehicle image:', err);
        return res.status(500).json({
            message: 'Failed to delete vehicle image',
            error: err.message
        });
    }
}

module.exports = {
    registerVehicle, 
    getVehicle, 
    getAllVehiclesByOwnerId, 
    getAvailability,
    updateVehicle, 
    blockDates,
    unblockDates,
    deleteVehicle, 
    deleteVehicleImage
};