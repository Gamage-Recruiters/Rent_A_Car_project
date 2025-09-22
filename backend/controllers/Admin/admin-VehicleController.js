const Vehicle = require('../../Models/vehicleModel');
const { normalizePlate, deNormalizePlate } = require('../../utils/licensePlateUtil');

// Get all pending vehicles
const getPendingVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isApproved: false });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending vehicles', error: error.message });
    }
};

// Approve a vehicle
const approveVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        if (vehicle.isApproved) return res.status(400).json({ message: 'Vehicle already approved' });

        vehicle.isApproved = true;
        await vehicle.save();
        res.status(200).json({ message: 'Vehicle approved successfully', vehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error approving vehicle', error: error.message });
    }
};

// Reject a vehicle (delete)
const rejectVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found or already deleted' });

        res.status(200).json({ message: 'Vehicle rejected and deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting vehicle', error: error.message });
    }
};

// Get all approved vehicles
const getApprovedVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ isApproved: true });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching approved vehicles', error: error.message });
    }
};

// Count only approved vehicles
const countApprovedVehicles = async (req, res) => {
    try {
        const total = await Vehicle.countDocuments({ isApproved: true });
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Error counting approved vehicles', error: error.message });
    }
};

// Search/filter vehicles
const searchVehicles = async (req, res) => {
    try {
        const { licensePlate, ownerId, isApproved } = req.query;
        let filter = {};

        if (licensePlate) {
            // Normalize input for search
            const { normalizePlate } = require('../../utils/licensePlateUtil');
            filter.vehicleLicenseNumber = normalizePlate(licensePlate);
        }
        if (ownerId) {
            filter.owner = ownerId;
        }
        if (isApproved !== undefined) {
            filter.isApproved = isApproved === 'true';
        }

        const vehicles = await Vehicle.find(filter);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error searching vehicles', error: error.message });
    }
};


module.exports = { getPendingVehicles, approveVehicle, rejectVehicle, getApprovedVehicles,countApprovedVehicles, searchVehicles };