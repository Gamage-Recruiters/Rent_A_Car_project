import React from "react";
import { mockVehicles } from "../../data/mockData";
import { TrendingUp } from "lucide-react";

const Analytics_Component: React.FC = () => {
  const ownerVehicles = mockVehicles.filter((v) => v.ownerId === "owner1");

  const analytics = {
    totalViews: 1250,
    bookingRate: 68,
    averageRating: 4.8,
    responseTime: "2 hours",
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Views</h3>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.totalViews}
          </p>
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            +15% this week
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Booking Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.bookingRate}%
          </p>
          <p className="text-sm text-blue-600">Above average</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Avg Rating</h3>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.averageRating}
          </p>
          <p className="text-sm text-yellow-600">Excellent</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Response Time</h3>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.responseTime}
          </p>
          <p className="text-sm text-green-600">Fast response</p>
        </div>
      </div>

      {/* Vehicle Performance Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Vehicle Performance</h3>
        <div className="space-y-4">
          {ownerVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{vehicle.name}</h4>
                  <p className="text-sm text-gray-600">{vehicle.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">85% booking rate</p>
                <p className="text-sm text-gray-500">245 views this month</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics_Component;
