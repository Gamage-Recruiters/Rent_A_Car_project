import React from "react";
import { mockVehicles } from "../../data/mockData";
import { TrendingUp } from "lucide-react";

const Earning_Component: React.FC = () => {
  const earnings = {
    thisMonth: 1250,
    lastMonth: 980,
    total: 5430,
    pending: 225,
  };

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

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">This Month</h3>
          <p className="text-3xl font-bold text-green-600">
            ${earnings.thisMonth}
          </p>
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            +27% vs last month
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Last Month</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${earnings.lastMonth}
          </p>
          <p className="text-sm text-gray-500">Previous period</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-blue-600">
            ${earnings.total}
          </p>
          <p className="text-sm text-gray-500">All time</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {bookingRequests
            .filter((b) => b.status === "completed")
            .map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={booking.vehicle.images[0]}
                    alt={booking.vehicle.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {booking.userName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {booking.vehicle.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.startDate}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +${booking.totalPrice}
                  </p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Payments</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-yellow-800">Pending Payout</p>
              <p className="text-sm text-yellow-600">
                Will be processed on next payout date
              </p>
            </div>
            <p className="text-xl font-bold text-yellow-800">
              ${earnings.pending}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earning_Component;
