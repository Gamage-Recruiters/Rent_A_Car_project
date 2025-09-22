const Customer = require('../../Models/customerModel');
const Booking = require('../../Models/bookingModel');
const Favorite = require('../../Models/favoriteModel');
const mongoose = require('mongoose');

async function getCustomerOverview(req, res) {
    try {
        const customerId = req.user.id;

        // Parallel queries for better performance
        const [
            customer,
            totalBookings,
            totalSpent,
            favoriteCount,
            upcomingTrips,
            completedBookings,
            pendingBookings,
            recentBookings,
            topFavoriteCars
        ] = await Promise.all([
            // Get customer info
            Customer.findById(customerId).select('firstName lastName email photo'),

            // Total bookings count
            Booking.countDocuments({ customer: customerId }),

            // Total amount spent (only completed bookings)
            Booking.aggregate([
                { $match: { customer: new mongoose.Types.ObjectId(customerId), bookingStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),

            // Total favorite cars
            Favorite.countDocuments({ customer: customerId }),

            // Upcoming trips (confirmed bookings with future pickup dates)
            Booking.countDocuments({
                customer: customerId,
                bookingStatus: { $in: ['confirmed', 'pending'] },
                pickupDate: { $gte: new Date() }
            }),

            // Completed bookings count
            Booking.countDocuments({ customer: customerId, bookingStatus: 'completed' }),

            // Pending bookings count
            Booking.countDocuments({ customer: customerId, bookingStatus: 'pending' }),

            // Recent bookings (last 5)
            Booking.find({ customer: customerId })
                .populate('vehicle', 'make model images')
                .populate('owner', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5)
                .select('vehicle owner pickupDate dropoffDate totalAmount bookingStatus paymentStatus'),

            // Top favorite cars
            Favorite.find({ customer: customerId })
                .populate('vehicle', 'make model images pricePerDay location')
                .limit(5)
                .sort({ createdAt: -1 })
        ]);

        // Calculate derived statistics
        const totalSpentAmount = totalSpent[0]?.total || 0;
        const averageBookingValue = totalBookings > 0 ? totalSpentAmount / completedBookings : 0;

        // Get booking statistics by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyBookings = await Booking.aggregate([
            {
                $match: {
                    customer: new mongoose.Types.ObjectId(customerId),
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Get upcoming trips details
        const upcomingTripsDetails = await Booking.find({
            customer: customerId,
            bookingStatus: { $in: ['confirmed', 'pending'] },
            pickupDate: { $gte: new Date() }
        })
        .populate('vehicle', 'make model images')
        .populate('owner', 'firstName lastName phoneNumber')
        .sort({ pickupDate: 1 })
        .limit(3)
        .select('vehicle owner pickupDate dropoffDate pickupLocation totalAmount bookingStatus paymentStatus');

        // Prepare response data
        const overview = {
            customer: {
                name: `${customer.firstName} ${customer.lastName}`.trim(),
                email: customer.email,
                photo: customer.photo,
                memberSince: customer.createdAt
            },
            statistics: {
                totalBookings,
                totalSpent: totalSpentAmount,
                averageBookingValue: Math.round(averageBookingValue),
                favoriteCount,
                upcomingTripsCount: upcomingTrips,
                completedBookings,
                pendingBookings
            },
            recentActivity: {
                recentBookings: recentBookings.map(booking => ({
                    id: booking._id,
                    vehicle: booking.vehicle ? {
                        make: booking.vehicle.make,
                        model: booking.vehicle.model,
                        image: booking.vehicle.images?.[0] || null
                    } : null,
                    owner: booking.owner ? {
                        name: `${booking.owner.firstName} ${booking.owner.lastName}`.trim()
                    } : null,
                    pickupDate: booking.pickupDate,
                    dropoffDate: booking.dropoffDate,
                    totalAmount: booking.totalAmount,
                    bookingStatus: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus
                }))
            },
            upcomingTrips: upcomingTripsDetails.map(trip => ({
                id: trip._id,
                vehicle: trip.vehicle ? {
                    make: trip.vehicle.make,
                    model: trip.vehicle.model,
                    image: trip.vehicle.images?.[0] || null
                } : null,
                owner: trip.owner ? {
                    name: `${trip.owner.firstName} ${trip.owner.lastName}`.trim(),
                    phone: trip.owner.phoneNumber
                } : null,
                pickupDate: trip.pickupDate,
                dropoffDate: trip.dropoffDate,
                pickupLocation: trip.pickupLocation,
                totalAmount: trip.totalAmount,
                bookingStatus: trip.bookingStatus,
                paymentStatus: trip.paymentStatus,
                daysUntilTrip: Math.ceil((trip.pickupDate - new Date()) / (1000 * 60 * 60 * 24))
            })),
            favoriteCars: topFavoriteCars.map(fav => ({
                id: fav._id,
                vehicle: fav.vehicle ? {
                    id: fav.vehicle._id,
                    make: fav.vehicle.make,
                    model: fav.vehicle.model,
                    image: fav.vehicle.images?.[0] || null,
                    pricePerDay: fav.vehicle.pricePerDay,
                    location: fav.vehicle.location
                } : null,
                addedAt: fav.createdAt
            })).filter(fav => fav.vehicle), // Filter out favorites with deleted vehicles
            monthlyStats: monthlyBookings.map(stat => ({
                month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
                bookings: stat.count,
                totalSpent: stat.totalSpent
            }))
        };

        res.status(200).json({
            success: true,
            message: 'Customer overview retrieved successfully',
            data: overview
        });

    } catch (error) {
        console.error('Get customer overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

async function getDetailedBookingStats(req, res) {
    try {
        const customerId = req.user.id;
        const { period = '6months' } = req.query; // 6months, 1year, all

        let dateFilter = {};
        if (period === '6months') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            dateFilter = { createdAt: { $gte: sixMonthsAgo } };
        } else if (period === '1year') {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            dateFilter = { createdAt: { $gte: oneYearAgo } };
        }

        const bookingStats = await Booking.aggregate([
            {
                $match: {
                    customer: new mongoose.Types.ObjectId(customerId),
                    ...dateFilter
                }
            },
            {
                $facet: {
                    statusBreakdown: [
                        {
                            $group: {
                                _id: '$bookingStatus',
                                count: { $sum: 1 },
                                totalAmount: { $sum: '$totalAmount' }
                            }
                        }
                    ],
                    monthlyTrends: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$createdAt' },
                                    month: { $month: '$createdAt' }
                                },
                                bookings: { $sum: 1 },
                                totalSpent: { $sum: '$totalAmount' },
                                avgAmount: { $avg: '$totalAmount' }
                            }
                        },
                        {
                            $sort: { '_id.year': 1, '_id.month': 1 }
                        }
                    ],
                    popularVehicles: [
                        {
                            $group: {
                                _id: '$vehicle',
                                bookings: { $sum: 1 },
                                totalSpent: { $sum: '$totalAmount' }
                            }
                        },
                        {
                            $sort: { bookings: -1 }
                        },
                        {
                            $limit: 5
                        },
                        {
                            $lookup: {
                                from: 'vehicles',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'vehicleInfo'
                            }
                        }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Detailed booking statistics retrieved successfully',
            data: bookingStats[0]
        });

    } catch (error) {
        console.error('Get detailed booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

module.exports = {
    getCustomerOverview,
    getDetailedBookingStats
};