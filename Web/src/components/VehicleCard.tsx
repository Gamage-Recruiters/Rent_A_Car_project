import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Fuel, Settings, MapPin } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  showContactInfo?: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, showContactInfo = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={vehicle.images[0]}
          alt={vehicle.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 shadow-md">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{vehicle.rating}</span>
          </div>
        </div>
        {vehicle.hasDriver && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Driver Available
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
          </span>
        </div>

        <div className="flex items-center space-x-1 mb-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">{vehicle.location}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{vehicle.seats} seats</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{vehicle.transmission}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs"
              >
                {feature}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="text-blue-600 text-xs">+{vehicle.features.length - 3} more</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">${vehicle.pricePerDay}</span>
            <span className="text-gray-500">/day</span>
            {vehicle.pricePerKm && (
              <div className="text-sm text-gray-500">
                ${vehicle.pricePerKm}/km
              </div>
            )}
          </div>
          <Link
            to={`/vehicle/${vehicle.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>

        {showContactInfo && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Phone: {vehicle.contactInfo.phone}</p>
              <p>Email: {vehicle.contactInfo.email}</p>
              <p>Address: {vehicle.contactInfo.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;