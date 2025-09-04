import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Clock, Star, Phone, Mail, Download, 
  CheckCircle, XCircle, AlertCircle, Eye,
  Car, User, CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

interface Booking {
  _id: string;
  customer: string;
  vehicle: {
    _id: string;
    vehicleName: string;
    brand: string;
    model: string;
    year: number;
    type: string;
    pricePerDay: number;
    location: string;
    images: string[];
    features: string[];
    rating?: number;
    reviewCount?: number;
    transmission: string;
    fuelType: string;
    seats: number;
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  idDocument: string[];
  drivingLicenseDocument: string[];
  createdAt: string;
  updatedAt: string;
}

const BookingTab: React.FC = () => {
  const { user } = useAuth(); // Add this line
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only fetch bookings if user is authenticated
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
      toast.error('Please log in to view your bookings');
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${API_URL}/customer/booking/my-bookings`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.success) {
        setBookings(response.data.bookings);
        console.log('Bookings fetched successfully:', response.data.bookings);
      } else {
        console.error('API returned success: false');
        toast.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          // Optionally redirect to login
          // window.location.href = '/login';
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch bookings');
        }
      } else {
        toast.error('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component code remains the same...
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/customer/booking/cancel/${bookingId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh bookings
      } else {
        toast.error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to view your bookings.</p>
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

  // Rest of your existing component code...
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = bookingFilter === 'all' || booking.bookingStatus === bookingFilter;
    const matchesSearch = booking.vehicle.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const BookingDetailsModal = ({ booking }: { booking: Booking }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Vehicle Information</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <img
                  src={constructImageUrl(booking.vehicle.images[0])}
                  alt={booking.vehicle.vehicleName}
                  className="w-full h-48 rounded-lg object-cover mb-4"
                />
                <h5 className="font-semibold text-lg">{booking.vehicle.vehicleName}</h5>
                <p className="text-gray-600">{booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.year})</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div><span className="font-medium">Type:</span> {booking.vehicle.type}</div>
                  <div><span className="font-medium">Seats:</span> {booking.vehicle.seats}</div>
                  <div><span className="font-medium">Transmission:</span> {booking.vehicle.transmission}</div>
                  <div><span className="font-medium">Fuel:</span> {booking.vehicle.fuelType}</div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Booking Information</h4>
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(booking.bookingStatus)}`}>
                    {getStatusIcon(booking.bookingStatus)}
                    <span className="ml-1 capitalize">{booking.bookingStatus}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Payment:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    <span className="capitalize">{booking.paymentStatus}</span>
                  </span>
                </div>
                <div>
                  <span className="font-medium">Pickup Location:</span>
                  <p className="text-gray-600 mt-1">{booking.pickupLocation}</p>
                </div>
                <div>
                  <span className="font-medium">Dropoff Location:</span>
                  <p className="text-gray-600 mt-1">{booking.dropoffLocation}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Pickup Date:</span>
                    <p className="text-gray-600">{formatDate(booking.pickupDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Dropoff Date:</span>
                    <p className="text-gray-600">{formatDate(booking.dropoffDate)}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <p className="text-gray-600">{calculateDays(booking.pickupDate, booking.dropoffDate)} days</p>
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span>
                  <p className="text-xl font-bold text-green-600">${booking.totalAmount}</p>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Owner Information</h4>
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="text-gray-600">{booking.owner.firstName} {booking.owner.lastName}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-gray-600">{booking.owner.email}</p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p className="text-gray-600">{booking.owner.phoneNumber}</p>
                </div>
                <div className="flex space-x-2 mt-4">
                  <a
                    href={`tel:${booking.owner.phoneNumber}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${booking.owner.email}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Documents</h4>
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <span className="font-medium">ID Documents:</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {booking.idDocument.map((doc, index) => (
                      <img
                        key={index}
                        src={constructImageUrl(doc)}
                        alt={`ID Document ${index + 1}`}
                        className="w-full h-24 rounded object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">License Documents:</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {booking.drivingLicenseDocument.map((doc, index) => (
                      <img
                        key={index}
                        src={constructImageUrl(doc)}
                        alt={`License Document ${index + 1}`}
                        className="w-full h-24 rounded object-cover border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {booking.bookingStatus === 'pending' && (
              <button
                onClick={() => {
                  handleCancelBooking(booking._id);
                  setShowDetails(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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
          <h3 className="text-xl font-semibold">My Bookings</h3>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {bookings.length === 0 
                ? "You haven't made any bookings yet." 
                : "No bookings match your current filter."}
            </p>
            <Link
              to="/search"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Car className="w-5 h-5" />
              <span>Find a Car</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={constructImageUrl(booking.vehicle.images[0])}
                      alt={booking.vehicle.vehicleName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {booking.vehicle.vehicleName}
                      </h4>
                      <p className="text-gray-600">
                        {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.year})
                      </p>
                      <p className="text-gray-600 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {booking.pickupLocation}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.pickupDate)} - {formatDate(booking.dropoffDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{calculateDays(booking.pickupDate, booking.dropoffDate)} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${booking.totalAmount}</p>
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(booking.bookingStatus)}`}>
                        {getStatusIcon(booking.bookingStatus)}
                        <span className="ml-1 capitalize">{booking.bookingStatus}</span>
                      </span>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus === 'paid' ? <CreditCard className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetails(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  
                  {booking.bookingStatus === 'completed' && (
                    <Link
                      to={`/write-review/${booking.vehicle._id}`}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm flex items-center space-x-1"
                    >
                      <Star className="w-4 h-4" />
                      <span>Write Review</span>
                    </Link>
                  )}
                  
                  {booking.bookingStatus === 'confirmed' && (
                    <a
                      href={`tel:${booking.owner.phoneNumber}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Contact Owner</span>
                    </a>
                  )}
                  
                  {booking.bookingStatus === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                  
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <BookingDetailsModal booking={selectedBooking} />
      )}
    </div>
  );
};

export default BookingTab;