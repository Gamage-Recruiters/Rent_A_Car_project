const Owner = require('../../Models/ownerModel');

//Get Pending Owners from registerOwner function where  controllers/Auth/owner/owner-authController.js

const getPendingOwners = async (req, res) => {
    try {
        const pendingOwners = await Owner.find({ isApproved: false }).select('-password');
        res.status(200).json(pendingOwners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending owners', error: error.message });
    }
};

// APPROVE an owner

const approveOwner = async (req, res) => {
    const ownerId = req.params.id;
    try {
        const owner = await Owner.findById(ownerId);
        if (!owner) return res.status(404).json({ message: 'Owner not found' });

        if (owner.isApproved) return res.status(400).json({ message: 'Owner already approved' });

        owner.isApproved = true;
        await owner.save();

        res.status(200).json({ message: 'Owner approved successfully', owner });
    } catch (error) {
        res.status(500).json({ message: 'Error approving owner', error: error.message });
    }
};
// REJECT  owner
const rejectOwner = async (req, res) => {
    const ownerId = req.params.id;
    try {
                const owner = await Owner.findByIdAndDelete(ownerId);

        if (!owner) return res.status(404).json({ message: 'Owner not found or already deleted' });

         res.status(200).json({ message: 'Owner rejected and deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting owner', error: error.message });
    }
};

// Get all approved owners
const getApprovedOwners = async (req, res) => {
    try {
        const owner = await Owner.find({ isApproved: true }).select('-password');
        res.status(200).json(owner);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};






module.exports = {getPendingOwners,approveOwner,rejectOwner,getApprovedOwners};
