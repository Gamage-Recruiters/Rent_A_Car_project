const Favorite = require('../../Models/favoriteModel');

async function addToFavorites(req, res) {
    const { vehicleId } = req.body;
    // Get user ID from the token verification middleware
    const customerId = req.userId || req.user?.id;

    if (!customerId) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated properly'
        });
    }

    try {
        const exists = await Favorite.findOne({
            customer: customerId,
            vehicle: vehicleId
        });

        if (exists) {
            return res.status(200).json({
                success: true,
                message: 'Vehicle is already in favorites',
                favorite: exists
            });
        }

        const favorite = await Favorite.create({
            customer: customerId,
            vehicle: vehicleId
        });

        return res.status(201).json({
            success: true,
            message: 'Vehicle added to favorites',
            favorite
        });
    } catch (error) {
        console.error("Error adding to favorites:", error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function removeFromFavorites(req, res) {
    const favoriteId = req.params.id;
    const customerId = req.userId || req.user?.id;

    if (!customerId) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated properly'
        });
    }

    try {
        const removed = await Favorite.findOneAndDelete({
            _id: favoriteId,
            customer: customerId
        });

        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Favorite not found or unauthorized'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Vehicle removed from favorites'
        });
    } catch (error) {
        console.error("Error removing from favorites:", error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function getFavorites(req, res) {
    const customerId = req.userId || req.user?.id;

    if (!customerId) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated properly'
        });
    }

    try {
        const favorites = await Favorite.find({ customer: customerId })
            .populate('vehicle')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            favorites
        });
    } catch (error) {
        console.error("Error getting favorites:", error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function checkIfFavorited(req, res) {
    const { vehicleId } = req.params;
    const customerId = req.userId || req.user?.id;

    if (!customerId) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated properly'
        });
    }

    try {
        const favorite = await Favorite.findOne({
            customer: customerId,
            vehicle: vehicleId
        });

        return res.status(200).json({
            success: true,
            isFavorited: !!favorite,
            favoriteId: favorite ? favorite._id : null
        });
    } catch (error) {
        console.error("Check favorite error:", error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { addToFavorites, removeFromFavorites, getFavorites, checkIfFavorited };