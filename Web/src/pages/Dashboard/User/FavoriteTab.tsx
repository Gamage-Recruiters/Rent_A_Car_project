import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Star, MapPin, Car, User, Search, Filter,
  Trash2, Eye, Calendar, Clock, Fuel, Users,
  AlertCircle, Zap, Droplets, Settings
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

interface FavoriteVehicle {
  _id: string;
  customer: string;
  vehicle: {
    _id: string;
    vehicleName: string;
    vehicleLicenseNumber: string;
    brand: string;
    model: string;
    year: string;
    vehicleType: string;
    images: string[];
    description: string;
    noSeats: number;
    fuelType: string;
    transmission: string;
    isDriverAvailable: boolean;
    pricePerDay: number;
    pricePerDistance: number;
    phoneNumber: number;
    pickupAddress: string;
    owner: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    unavailableDates: string[];
    isAvailable: boolean;
    isApproved: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const FavoriteTab: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      console.log('Fetching favorites...');
      
      const response = await axios.get(`${API_URL}/customer/favorite/list`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Favorites response:', response.data);

      if (response.data.success) {
        setFavorites(response.data.favorites || []);
        console.log('Favorites fetched successfully:', response.data.favorites);
      } else {
        console.error('API returned success: false');
        toast.error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch favorites');
        }
      } else {
        toast.error('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!confirm('Are you sure you want to remove this vehicle from favorites?')) {
      return;
    }

    try {
      setRemoving(favoriteId);
      
      const response = await axios.delete(`${API_URL}/customer/favorite/remove/${favoriteId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setFavorites(favorites.filter(fav => fav._id !== favoriteId));
        toast.success('Vehicle removed from favorites');
      } else {
        toast.error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || 'Failed to remove from favorites');
      } else {
        toast.error('Network error occurred');
      }
    } finally {
      setRemoving(null);
    }
  };

  const constructImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder-car.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    return `${BASE_URL}/uploads/vehicles/${imagePath}`;
  };

  const getTransmissionIcon = (transmission: string) => {
  return transmission?.toLowerCase() === 'manual' ? 
    <Settings className="w-4 h-4" /> : 
    <Settings className="w-4 h-4" />;
};

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'electric': return <Zap className="w-4 h-4" />;
      case 'hybrid': return <Fuel className="w-4 h-4" />;
      default: return <Droplets className="w-4 h-4" />;
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    // Check if vehicle exists
    if (!favorite.vehicle) {
      return false; // Skip this favorite if vehicle is null
    }

    const vehicle = favorite.vehicle;
    const matchesSearch = 
      (vehicle.vehicleName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (vehicle.pickupAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (vehicle.vehicleType?.toLowerCase() || '') === filterType.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to view your favorite vehicles.</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Log In</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Favorite Vehicles</h3>
            <p className="text-gray-600">Your saved vehicles for quick access</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="luxury">Luxury</option>
              <option value="sports">Sports</option>
              <option value="van">Van</option>
            </select>
          </div>
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {favorites.length === 0 ? 'No Favorite Vehicles' : 'No Matching Favorites'}
            </h3>
            <p className="text-gray-600 mb-4">
              {favorites.length === 0 
                ? "You haven't added any vehicles to your favorites yet." 
                : "No favorites match your current search or filter."}
            </p>
            <Link
              to="/search"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>Find Vehicles</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <div key={favorite._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                {/* Vehicle Image */}
                <div className="relative">
                  <img
                    src={favorite.vehicle?.images?.[0] ? constructImageUrl(favorite.vehicle.images[0]) : '/placeholder-car.jpg'}
                    alt={favorite.vehicle?.vehicleName || 'Vehicle'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      favorite.vehicle?.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {favorite.vehicle?.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-blue-600 text-white px-2 py-1 text-xs rounded-full capitalize">
                      {favorite.vehicle?.vehicleType || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg text-gray-900 truncate">
                      {favorite.vehicle?.vehicleName || 'Unknown Vehicle'}
                    </h4>
                    <button
                      onClick={() => handleRemoveFavorite(favorite._id)}
                      disabled={removing === favorite._id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from favorites"
                    >
                      {removing === favorite._id ? (
                        <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Heart className="w-5 h-5 fill-current" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">
                    {favorite.vehicle.brand} {favorite.vehicle.model} ({favorite.vehicle.year})
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{favorite.vehicle.pickupAddress}</span>
                  </p>

                  {/* Vehicle Features */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{favorite.vehicle.noSeats} seats</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getTransmissionIcon(favorite.vehicle.transmission)}
                      <span className="capitalize">{favorite.vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getFuelIcon(favorite.vehicle.fuelType)}
                      <span className="capitalize">{favorite.vehicle.fuelType}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Car className="w-3 h-3" />
                      <span>{favorite.vehicle.isDriverAvailable ? 'With Driver' : 'Self Drive'}</span>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="text-xs text-gray-500 mb-3 border-t pt-2">
                    <p>Owner: {favorite.vehicle.owner.firstName} {favorite.vehicle.owner.lastName}</p>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-blue-600">
                        ${favorite.vehicle.pricePerDay}
                      </span>
                      <span className="text-gray-500 text-sm">/day</span>
                      {favorite.vehicle.pricePerDistance > 0 && (
                        <p className="text-xs text-gray-500">
                          +${favorite.vehicle.pricePerDistance}/km
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/vehicle/${favorite.vehicle._id}`}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                      {favorite.vehicle.isAvailable ? (
                        <Link
                        to={`/booking/${favorite.vehicle._id}`}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                        >
                        <Calendar className="w-4 h-4" />
                        <span>Book</span>
                        </Link>
                    ) : (
                        <button
                        disabled
                        className="bg-gray-400 text-white px-3 py-2 rounded-lg cursor-not-allowed transition-colors text-sm flex items-center space-x-1 opacity-50"
                        title="Vehicle not available for booking"
                        >
                        <Calendar className="w-4 h-4" />
                        <span>Book</span>
                        </button>
                    )}
                    </div>
                  </div>

                  {/* Added Date */}
                  <div className="text-xs text-gray-400 mt-2 border-t pt-2">
                    Added on {new Date(favorite.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {favorites.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Favorites: {favorites.length}</span>
              <span>Available: {favorites.filter(f => f.vehicle && f.vehicle.isAvailable).length}</span>
              <span>Showing: {filteredFavorites.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteTab;