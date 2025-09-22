import React, { useState } from "react";
import { mockVehicles } from "../../data/mockData";
import { Eye, Edit3, Trash2, MapPin, Star } from "lucide-react";

const Vehicle_component: React.FC = () => {
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const ownerVehicles = mockVehicles.filter((v) => v.ownerId === "owner1");

  const filteredVehicles =
    vehicleFilter === "all"
      ? ownerVehicles
      : ownerVehicles.filter((vehicle) => {
          if (vehicleFilter === "available") return vehicle.availability;
          if (vehicleFilter === "rented") return !vehicle.availability;
          return true;
        });

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-xl font-semibold">My Vehicles</h3>
        <div className="flex space-x-4">
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Vehicles</option>
            <option value="available">Available</option>
            <option value="rented">Currently Rented</option>
          </select>
          {/* Add Vehicle Link (commented) */}
          {/*
          <Link
            to="/add-vehicle"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vehicle</span>
          </Link>
          */}
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Vehicle Image and Availability */}
            <div className="relative">
              <img
                src={vehicle.images[0]}
                alt={vehicle.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.availability
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {vehicle.availability ? "Available" : "Rented"}
                </span>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6">
              {/* Name, Location, Rating */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {vehicle.name}
                  </h4>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {vehicle.location}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{vehicle.rating}</span>
                </div>
              </div>

              {/* Price and Reviews */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-green-600">
                  ${vehicle.pricePerDay}/day
                </span>
                <span className="text-sm text-gray-500">
                  {vehicle.reviewCount} reviews
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Views</p>
                  <p className="font-semibold">245</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Bookings</p>
                  <p className="font-semibold">12</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Earnings</p>
                  <p className="font-semibold">$540</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vehicle_component;
