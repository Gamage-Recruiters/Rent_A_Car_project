import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Car, Phone, Mail, Download, Share2, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/booking-confirmation/${bookingId}` } });
      return;
    }
    
    fetchBooking();
  }, [bookingId, user]);
  
  const fetchBooking = async () => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/customer/booking/${bookingId}`, {
        withCredentials: true
      });
      
      if (response.data?.success) {
        setBooking(response.data.booking);
      } else {
        setError('Failed to load booking details');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Error loading booking details');
    } finally {
      setLoading(false);
    }
  };
  
  const constructImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/placeholder-car.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    return `${BASE_URL}/uploads/vehicles/${imagePath}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const calculateDays = () => {
    if (!booking) return 0;
    
    const start = new Date(booking.pickupDate);
    const end = new Date(booking.dropoffDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const vehicle = booking.vehicle;
  const owner = booking.owner;
  const confirmationCode = `RC-${booking._id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 text-lg">
              Your reservation has been successfully confirmed. Here are your booking details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Confirmation Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Confirmation Code</h3>
                    <p className="text-2xl font-bold text-blue-600">{confirmationCode}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Booking ID</h3>
                    <p className="text-gray-600">{booking._id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Total Amount</h3>
                    <p className="text-2xl font-bold text-gray-900">${booking.totalAmount}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                    <p className="text-gray-600">{calculateDays()} days</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Information</h2>
                
                <div className="flex items-start space-x-4">
                  <img
                    src={vehicle.images && vehicle.images.length > 0 
                      ? constructImageUrl(vehicle.images[0]) 
                      : '/placeholder-car.jpg'}
                    alt={vehicle.vehicleName}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{vehicle.vehicleName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4" />
                        <span>{vehicle.vehicleType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{vehicle.location || vehicle.pickupAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Rental Period</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Pickup</h3>
                      <p className="text-gray-600">{formatDate(booking.pickupDate)}</p>
                      <p className="text-sm text-gray-500">{booking.pickupLocation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Return</h3>
                      <p className="text-gray-600">{formatDate(booking.dropoffDate)}</p>
                      <p className="text-sm text-gray-500">{booking.dropoffLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Owner Contact</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">{owner.phoneNumber || vehicle.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">{owner.email || vehicle.email || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Pickup Address</h4>
                  <p className="text-blue-700">{vehicle.pickupAddress}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Download Receipt</span>
                  </button>
                  
                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <Share2 className="w-5 h-5" />
                    <span>Share Booking</span>
                  </button>
                  
                  <Link
                    to="/dashboard"
                    className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    View All Bookings
                  </Link>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-yellow-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Important Information</h3>
                
                <ul className="space-y-2 text-yellow-800 text-sm">
                  <li>• Bring a valid driver's license and ID</li>
                  <li>• Arrive 15 minutes before pickup time</li>
                  <li>• Inspect the vehicle before driving</li>
                  <li>• Return with the same fuel level</li>
                  <li>• Contact owner for any issues</li>
                </ul>
              </div>

              {/* Support */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                
                <div className="space-y-3">
                  <Link
                    to="/help"
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View Help Center
                  </Link>
                  <Link
                    to="/contact"
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Contact Support
                  </Link>
                  <p className="text-gray-600 text-sm">
                    24/7 support: +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;