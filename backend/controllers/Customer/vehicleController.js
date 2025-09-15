const Vehicle = require('../../Models/vehicleModel');
const Review = require('../../Models/reviewModel');

async function getVehicleRatings(vehicleId) {
    try {
        const reviews = await Review.find({ vehicle: vehicleId });
        if (!reviews || reviews.length === 0) {
            return { rating: 0, reviewCount: 0 };
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        
        return {
            rating: parseFloat(averageRating),
            reviewCount: reviews.length
        };
    } catch (error) {
        console.error(`Error calculating rating for vehicle ${vehicleId}:`, error);
        return { rating: 0, reviewCount: 0 };
    }
}

async function addRatingsToVehicles(vehicles) {
    // Convert to plain objects if they're Mongoose documents
    const vehiclesArray = vehicles.map(v => v.toObject ? v.toObject() : v);
    
    // Add ratings for each vehicle
    const vehiclesWithRatings = await Promise.all(
        vehiclesArray.map(async (vehicle) => {
            const { rating, reviewCount } = await getVehicleRatings(vehicle._id);
            return {
                ...vehicle,
                rating,
                reviewCount
            };
        })
    );
    
    return vehiclesWithRatings;
}

async function getAllVehicles(req, res) {
    try {
        const { 
            vehicleType, 
            fuelType, 
            transmission, 
            minPrice, 
            maxPrice, 
            location,
            page = 1,
            limit = 10,
            sort = 'createdAt'
        } = req.query;

        const filter = {
            isApproved: true,
            isAvailable: true
        };

        if (vehicleType) filter.vehicleType = vehicleType;
        if (fuelType) filter.fuelType = fuelType;
        if (transmission) filter.transmission = transmission;
        if (location) filter.location = location;
        
        if (minPrice || maxPrice) {
            filter.pricePerDay = {};
            if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
        }

        const skip = (Number(page) - 1) * Number(limit);
        
        const vehicles = await Vehicle.find(filter)
            .populate('owner', 'firstName lastName email')
            .sort({ [sort]: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Add ratings to vehicles
        const vehiclesWithRatings = await addRatingsToVehicles(vehicles);

        const totalVehicles = await Vehicle.countDocuments(filter);
        const totalPages = Math.ceil(totalVehicles / Number(limit));
        
        return res.status(200).json({
            success: true,
            count: vehicles.length,
            totalVehicles,
            totalPages,
            currentPage: Number(page),
            data: vehiclesWithRatings
        });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

async function getVehicleById(req, res) {
    try {
        const vehicle = await Vehicle.findById({
            _id: req.params.id,
            isApproved: true,
        }).populate('owner', 'firstName lastName email');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Get rating for this specific vehicle
        const vehicleObj = vehicle.toObject();
        const { rating, reviewCount } = await getVehicleRatings(vehicle._id);
        vehicleObj.rating = rating;
        vehicleObj.reviewCount = reviewCount;

        return res.status(200).json({
            success: true,
            data: vehicleObj
        });
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

async function searchVehicles(req, res) {
    try {
        const { query } = req.query;

        if(!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const vehicles = await Vehicle.find({
            isApproved: true,
            isAvailable: true,
            $or: [
                { vehicleName: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { model: { $regex: query, $options: 'i' } },
                { vehicleType: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } }
            ]
        }).populate('owner', 'firstName lastName email')
          .sort({ createdAt: -1 });

        // Add ratings to search results
        const vehiclesWithRatings = await addRatingsToVehicles(vehicles);

        return res.status(200).json({
            success: true,
            count: vehiclesWithRatings.length,
            data: vehiclesWithRatings
        });
    } catch (error) {
        console.error('Error searching vehicles:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { getAllVehicles, getVehicleById, searchVehicles };