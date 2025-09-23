// --- ImageWithFallback component ---
type ImageWithFallbackProps = {
  src?: string;
  alt?: string;
};

function ImageWithFallback({ src, alt }: ImageWithFallbackProps) {
  const [imgError, setImgError] = React.useState(false);
  const showFallback = imgError || !src;
  return (
    <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
      {!showFallback && (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover absolute top-0 left-0"
          onError={() => setImgError(true)}
        />
      )}
      {showFallback && (
        <div className="w-full h-full flex items-center justify-center text-gray-400 absolute top-0 left-0" style={{ pointerEvents: 'none' }}>
          <Car className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Calendar, Clock, Car, User, Plus, Eye,
  CheckCircle, XCircle, AlertCircle, CreditCard, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

interface RecentBooking {
  _id: string;
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  vehicle: {
    _id: string;
    vehicleName: string;
    vehicleLicenseNumber: string;
    images?: string[];
    vehicleType?: string;
    brand?: string;
    model?: string;
    year?: string;
    pricePerDay?: number;
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const RecentBookingsTab: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('RecentBookingsTab mounted, user:', user);
    if (user) {
      fetchRecentBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching recent bookings from:', `${API_URL}/customer/rental-history`);
      
      const response = await axios.get(`${API_URL}/customer/rental-history`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Recent bookings response:', response.data);

      if (response.data?.success) {
        const bookingsData = response.data.data || [];
        console.log('Recent bookings data:', bookingsData);
        
        // Get only the 3 most recent bookings
        const recentBookings = bookingsData.slice(0, 3);
        setBookings(recentBookings);
        
        console.log(`Found ${recentBookings.length} recent bookings`);
      } else {
        console.error('API returned success: false');
        setError('Failed to fetch recent bookings - API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:');
        console.error('- Status:', error.response?.status);
        console.error('- Data:', error.response?.data);
        
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          toast.error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          setError('Bookings endpoint not found.');
          toast.error('Bookings endpoint not found');
        } else {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch recent bookings';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        console.error('Non-axios error:', error);
        setError('Network error occurred');
        toast.error('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const constructImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder-car.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${BASE_URL}${imagePath}`;
    // If only filename is provided
    return `${BASE_URL}/uploads/vehicles/${imagePath}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Bookings</h3>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Recent Bookings</h3>
          <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
            <Plus className="w-4 h-4" />
            <span>Book New Car</span>
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h4>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRecentBookings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Recent Bookings</h3>
        <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
          <Plus className="w-4 h-4" />
          <span>Book New Car</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Bookings</h4>
          <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
          <Link
            to="/search"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Book Your First Car</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              {/* Vehicle Image */}
              <ImageWithFallback
                src={booking.vehicle?.images && booking.vehicle.images.length > 0 ? constructImageUrl(booking.vehicle.images[0]) : undefined}
                alt={booking.vehicle?.vehicleName || 'Vehicle'}
              />

              {/* Booking Details */}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {booking.vehicle?.vehicleName || 'Unknown Vehicle'}
                </h4>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booking.pickupLocation}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(booking.pickupDate)} to {formatDate(booking.dropoffDate)}
                </p>
              </div>

              {/* Price and Status */}
              <div className="text-right">
                <p className="font-semibold text-gray-900">${booking.totalAmount}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(booking.bookingStatus)}`}>
                  {getStatusIcon(booking.bookingStatus)}
                  <span className="ml-1 capitalize">{booking.bookingStatus}</span>
                </span>
                
                {/* Payment Status */}
                <div className="flex items-center justify-end mt-1 text-xs">
                  <CreditCard className="w-3 h-3 mr-1" />
                  <span className={`capitalize ${
                    booking.paymentStatus === 'paid' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                
                {/* View Details Link */}
                <div className="mt-2">
                  <Link
                    to={`/vehicle/${booking.vehicle?._id}`}
                    className="text-blue-600 hover:text-blue-700 text-xs flex items-center justify-end space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Link */}
      {bookings.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            to="/search"
            onClick={() => {
              // Assuming you have a way to set active tab in parent
              // You might need to pass this as a prop or use context
            }}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center space-x-1"
          >
            <Calendar className="w-4 h-4" />
            <span>View All Bookings</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentBookingsTab;