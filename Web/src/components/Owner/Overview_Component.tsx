import React, { useState } from "react";
import { Link } from "react-router-dom";
import { mockVehicles } from "../../data/mockData";
import {
  Car,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,

  Activity,
} from "lucide-react";

const Overview_Component: React.FC = () => {

      const [activeTab, setActiveTab] = useState("overview");

    const bookingRequests = [
        {
          id: "1",
          vehicleId: "1",
          userName: "John Smith",
          userEmail: "john@example.com",
          userPhone: "+1234567890",
          startDate: "2024-01-20",
          endDate: "2024-01-23",
          totalPrice: 135,
          status: "pending",
          vehicle: mockVehicles[0],
          requestedAt: "2024-01-15T10:30:00Z",
          notes: "Need the car for a business trip",
        },
        {
          id: "2",
          vehicleId: "1",
          userName: "Sarah Johnson",
          userEmail: "sarah@example.com",
          userPhone: "+1234567891",
          startDate: "2024-01-25",
          endDate: "2024-01-27",
          totalPrice: 90,
          status: "confirmed",
          vehicle: mockVehicles[0],
          requestedAt: "2024-01-14T15:20:00Z",
          notes: "Weekend getaway",
        },
        {
          id: "3",
          vehicleId: "1",
          userName: "Mike Davis",
          userEmail: "mike@example.com",
          userPhone: "+1234567892",
          startDate: "2024-01-10",
          endDate: "2024-01-12",
          totalPrice: 90,
          status: "completed",
          vehicle: mockVehicles[0],
          requestedAt: "2024-01-05T09:15:00Z",
          notes: "Airport pickup needed",
        },
        {
          id: "4",
          vehicleId: "1",
          userName: "Emily Wilson",
          userEmail: "emily@example.com",
          userPhone: "+1234567893",
          startDate: "2024-01-08",
          endDate: "2024-01-10",
          totalPrice: 90,
          status: "cancelled",
          vehicle: mockVehicles[0],
          requestedAt: "2024-01-03T14:45:00Z",
          notes: "Plans changed",
        },
      ];

        const earnings = {
        thisMonth: 1250,
        lastMonth: 980,
        total: 5430,
        pending: 225,
    };

      const analytics = {
    totalViews: 1250,
    bookingRate: 68,
    averageRating: 4.8,
    responseTime: "2 hours",
  };

        const getStatusColor = (status: string) => {
     switch (status) {
       case "pending":
         return "bg-yellow-100 text-yellow-800";
       case "confirmed":
         return "bg-blue-100 text-blue-800";
       case "completed":
         return "bg-green-100 text-green-800";
       case "cancelled":
         return "bg-red-100 text-red-800";
       default:
         return "bg-gray-100 text-gray-800";
     }
   };
 
       const getStatusIcon = (status: string) => {
     switch (status) {
       case "pending":
         return <Clock className="w-4 h-4" />;
       case "confirmed":
         return <CheckCircle className="w-4 h-4" />;
       case "completed":
         return <CheckCircle className="w-4 h-4" />;
       case "cancelled":
         return <XCircle className="w-4 h-4" />;
       default:
         return <Clock className="w-4 h-4" />;
     }
   };

    const ownerVehicles = mockVehicles.filter((v) => v.ownerId === "owner1");

    
  const pendingRequests = bookingRequests.filter(
    (b) => b.status === "pending"
  ).length;

      const activeBookings = bookingRequests.filter(
    (b) => b.status === "confirmed"
  ).length;


  return (
    <>
      <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Vehicles</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {ownerVehicles.length}
                        </p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +1 this month
                        </p>
                      </div>
                      <Car className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {activeBookings}
                        </p>
                        <p className="text-xs text-blue-600">Current rentals</p>
                      </div>
                      <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Pending Requests
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {pendingRequests}
                        </p>
                        <p className="text-xs text-yellow-600">
                          Needs attention
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Monthly Earnings
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${earnings.thisMonth}
                        </p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +27% vs last month
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">
                            New booking confirmed
                          </p>
                          <p className="text-xs text-gray-500">
                            Toyota Camry - Sarah Johnson
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Pending booking request
                          </p>
                          <p className="text-xs text-gray-500">
                            Toyota Camry - John Smith
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Payment received
                          </p>
                          <p className="text-xs text-gray-500">
                            $90 from Mike Davis
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      Performance Overview
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Booking Rate
                          </span>
                          <span className="text-sm font-semibold">
                            {analytics.bookingRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${analytics.bookingRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Customer Rating
                          </span>
                          <span className="text-sm font-semibold">
                            {analytics.averageRating}/5.0
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${(analytics.averageRating / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Response Time
                          </span>
                          <span className="text-sm font-semibold">
                            {analytics.responseTime}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">
                      Recent Booking Requests
                    </h3>
                    <Link
                      to="#"
                      onClick={() => setActiveTab("bookings")}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {bookingRequests.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={booking.vehicle.images[0]}
                            alt={booking.vehicle.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {booking.userName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {booking.vehicle.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.startDate} to {booking.endDate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${booking.totalPrice}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
    </>
  );
};

export default Overview_Component;
