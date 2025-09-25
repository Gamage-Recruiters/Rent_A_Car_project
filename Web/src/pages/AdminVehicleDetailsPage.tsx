import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, AlertCircle,
  Car, Users, Fuel, Settings, MapPin,
  Calendar, Star, Clock, Phone, Mail, Shield
} from 'lucide-react';
import { Vehicle } from '../types';
import { mockVehicles } from '../data/mockData';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_URL = `${BASE.replace(/\/$/, '')}/superadmin`;

const AdminVehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return setError('No vehicle id');
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/vehicles/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body?.message || `Failed to load vehicle (${res.status})`);
          return;
        }
        const v = await res.json();
        setVehicle({
          // map backend fields to your Vehicle type as needed
          id: v._id ?? v.id,
          name: v.name ?? v.vehicleName ?? 'Unnamed',
          brand: v.brand ?? '',
          model: v.model ?? '',
          images: v.images ?? [],
          pricePerDay: v.pricePerDay ?? v.dailyPrice ?? 0,
          pricePerKm: v.pricePerKm,
          type: v.type ?? '',
          seats: v.seats ?? 0,
          fuelType: v.fuelType ?? '',
          transmission: v.transmission ?? '',
          year: v.year ?? '',
          mileage: v.mileage ?? '',
          description: v.description ?? '',
          rating: v.rating ?? 0,
          reviewCount: v.reviewCount ?? 0,
          location: v.location ?? '',
          contactInfo: v.contactInfo ?? { email: v.email ?? '', phone: v.phone ?? '', address: v.address ?? '' },
          // add other fields if your Vehicle type expects them
        } as Vehicle);
      } catch (err) {
        setError('Failed to load vehicle details');
        console.error(err);
      } finally {
        setLoading(false);
        }
    };

    fetchVehicleDetails();
  }, [id]);

  const handleBack = () => navigate('/admin-vehicle-listings');
  const handleApprove = async () => {
    if (!vehicle?.id) return;
    try {
      const res = await fetch(`${API_URL}/vehicles/approve/${vehicle.id}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.message || 'Approve failed');
        return;
      }
      alert('Vehicle approved');
      navigate('/admin-vehicle-listings');
    } catch (err) {
      console.error(err);
      alert('Error approving vehicle');
    }
  };
  const handleReject = async () => {
    if (!vehicle?.id) return;
    if (!confirm('Reject and delete this vehicle?')) return;
    try {
      const res = await fetch(`${API_URL}/vehicles/reject/${vehicle.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.message || 'Reject failed');
        return;
      }
      alert('Vehicle rejected and deleted');
      navigate('/admin-vehicle-listings');
    } catch (err) {
      console.error(err);
      alert('Error rejecting vehicle');
    }
  };
  const getStatusBadge = () => {
    if (!vehicle?.status) return null;
    
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending Approval' },
      approved: { color: 'green', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' }
    };
    
    const config = statusConfig[vehicle.status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Vehicle</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Listings
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>
                      {vehicle.rating} <span className="text-gray-500">({vehicle.reviewCount} reviews)</span>
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{vehicle.location}</span>
                  </div>
                </div>
              </div>
              <div>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                <img
                  src={vehicle.images[activeImageIndex] || vehicle.images[0]}
                  alt={`${vehicle.name} - Main view`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-md border-2 ${activeImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle.name} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Features */}
              <div className="pt-6">
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(vehicle?.features ?? []).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Vehicle Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Car className="w-5 h-5 mr-2" />
                      <span className="text-sm">Type</span>
                    </div>
                    <p className="font-medium capitalize">{vehicle.type}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Users className="w-5 h-5 mr-2" />
                      <span className="text-sm">Seats</span>
                    </div>
                    <p className="font-medium">{vehicle.seats}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Fuel className="w-5 h-5 mr-2" />
                      <span className="text-sm">Fuel Type</span>
                    </div>
                    <p className="font-medium capitalize">{vehicle.fuelType}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Settings className="w-5 h-5 mr-2" />
                      <span className="text-sm">Transmission</span>
                    </div>
                    <p className="font-medium capitalize">{vehicle.transmission}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="text-sm">Year</span>
                    </div>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="text-sm">Mileage</span>
                    </div>
                    <p className="font-medium">{vehicle.mileage || 'N/A'} km/l</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Daily Rate</p>
                    <p className="text-2xl font-bold text-blue-600">${vehicle.pricePerDay}</p>
                  </div>
                  {vehicle.pricePerKm && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Per Kilometer</p>
                      <p className="text-2xl font-bold text-blue-600">${vehicle.pricePerKm}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Owner Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">O</span>
                    </div>
                    <div>
                      <p className="font-medium">Owner ID: {vehicle.ownerId}</p>
                      <p className="text-sm text-gray-600">{vehicle.contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">{vehicle.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">{vehicle.contactInfo.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 pt-2 pb-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{vehicle.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-4">
            <button
              onClick={handleReject}
              className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              Reject Vehicle
            </button>
            <button
              onClick={handleApprove}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Approve Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVehicleDetailsPage;
