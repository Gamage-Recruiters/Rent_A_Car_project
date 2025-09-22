import React, { useState } from "react";
import { mockVehicles } from "../../data/mockData";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Phone,
  Mail,
  Download,
} from "lucide-react";

const Booking_Component: React.FC = () => {
    const [bookingFilter, setBookingFilter] = useState("all");
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

      const filteredBookings =
        bookingFilter === "all"
        ? bookingRequests
        : bookingRequests.filter((booking) => booking.status === bookingFilter);
  return (
    <>
      <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                    <h3 className="text-xl font-semibold">Booking Requests</h3>
                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Bookings</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-6">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={booking.vehicle.images[0]}
                              alt={booking.vehicle.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {booking.userName}
                              </h4>
                              <p className="text-gray-600">
                                {booking.userEmail}
                              </p>
                              <p className="text-sm text-gray-500">
                                {booking.vehicle.name}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {booking.startDate} to {booking.endDate}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      booking.requestedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ${booking.totalPrice}
                            </p>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>Customer Notes:</strong> {booking.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{booking.userPhone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{booking.userEmail}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {booking.status === "pending" && (
                              <>
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Accept</span>
                                </button>
                                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                                  <XCircle className="w-4 h-4" />
                                  <span>Decline</span>
                                </button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                                <MessageCircle className="w-4 h-4" />
                                <span>Contact Customer</span>
                              </button>
                            )}
                            {booking.status === "completed" && (
                              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                                <Download className="w-4 h-4" />
                                <span>Download Receipt</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
    </>
  );
};

export default Booking_Component;


