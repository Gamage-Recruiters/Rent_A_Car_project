const Favorite = require('../../Models/favoriteModel');

async function addToFavorites(req, res) {
    const { vehicleId } = req.body;

    try {
        const exists = await Favorite.findOne({
            customer: req.user.id,
            vehicle: vehicleId
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is already in favorites'
            });
        }

        const favorite = await Favorite.create({
            customer: req.user.id,
            vehicle: vehicleId
        });

        return res.status(201).json({
            success: true,
            message: 'Vehicle added to favorites',
            favorite
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


async function removeFromFavorites(req, res) {
    const favoriteId = req.params.id;

    try {
        const removed = await Favorite.findOneAndDelete({
            _id: favoriteId,
            customer: req.user.id
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
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function getFavorites(req, res) {
    try {
        const favorites = await Favorite.find({ customer: req.user.id })
            .populate('vehicle')
            .populate('customer')
            .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                favorites
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

async function checkIfFavorited(req, res) {
    const { vehicleId } = req.params;

    try {
        const favorite = await Favorite.findOne({
            customer: req.user.id,
            vehicle: vehicleId
        });

        return res.status(200).json({
            success: true,
            isFavorited: !!favorite,
            favoriteId: favorite ? favorite._id : null
        });
    } catch (error) {
        console.error('Check favorite error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { addToFavorites, removeFromFavorites, getFavorites, checkIfFavorited };