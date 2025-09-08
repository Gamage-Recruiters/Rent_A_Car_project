import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, MapPin, User, Calendar, Car, Star, Search, Filter,
  Eye, Download, RotateCcw, CheckCircle, XCircle, AlertCircle,
  FileText, CreditCard, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

interface RentalHistory {
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

const RentalHistoryTab: React.FC = () => {
  const { user } = useAuth();
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('RentalHistoryTab mounted, user:', user);
    if (user) {
      fetchRentalHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching rental history from:', `${API_URL}/customer/rental-history`);
      
      const response = await axios.get(`${API_URL}/customer/rental-history`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Rental history response:', response.data);

      if (response.data?.success) {
        const historyData = response.data.data || [];
        console.log('Rental history data:', historyData);
        setRentalHistory(historyData);
        
        if (historyData.length === 0) {
          console.log('No rental history found');
        } else {
          console.log(`Found ${historyData.length} rental records`);
        }
      } else {
        console.error('API returned success: false');
        setError('Failed to fetch rental history - API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching rental history:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:');
        console.error('- Status:', error.response?.status);
        console.error('- Data:', error.response?.data);
        
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          toast.error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 404) {
          setError('Rental history endpoint not found.');
          toast.error('Rental history endpoint not found');
        } else {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch rental history';
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

  const constructImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder-car.jpg';
    
    console.log('Original image path:', imagePath);
    
    if (imagePath.startsWith('http')) {
      console.log('Using full URL:', imagePath);
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      const fullUrl = `${BASE_URL}${imagePath}`;
      console.log('Constructed URL from /uploads:', fullUrl);
      return fullUrl;
    }
    
    if (imagePath.includes('uploads/')) {
      const fullUrl = `${BASE_URL}/${imagePath}`;
      console.log('Constructed URL with uploads:', fullUrl);
      return fullUrl;
    }
    
    const fallbackUrl = `${BASE_URL}/uploads/vehicles/${imagePath}`;
    console.log('Using fallback URL:', fallbackUrl);
    return fallbackUrl;
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (pickup: string, dropoff: string) => {
    const pickupDate = new Date(pickup);
    const dropoffDate = new Date(dropoff);
    const diffTime = Math.abs(dropoffDate.getTime() - pickupDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredHistory = rentalHistory.filter(rental => {
    const matchesSearch = 
      rental.vehicle?.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.dropoffLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.owner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.owner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rental.bookingStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || rental.paymentStatus === paymentFilter;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const rentalDate = new Date(rental.createdAt);
      const now = new Date();
      
      switch (dateRange) {
        case 'week':
          matchesDate = (now.getTime() - rentalDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          matchesDate = (now.getTime() - rentalDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          break;
        case 'year':
          matchesDate = (now.getTime() - rentalDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to view your rental history.</p>
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
          <p className="ml-4 text-gray-600">Loading your rental history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Rental History</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRentalHistory}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Header and Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Rental History</h3>
            <p className="text-gray-600">Your complete rental transaction history</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search rentals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
            </select>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {rentalHistory.length === 0 ? 'No Rental History' : 'No Matching Records'}
            </h3>
            <p className="text-gray-600 mb-4">
              {rentalHistory.length === 0 
                ? "You haven't rented any vehicles yet." 
                : "No rental records match your current filters."}
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
          <div className="space-y-4">
            {filteredHistory.map((rental) => (
              <div key={rental._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Vehicle Info */}
                  <div className="flex items-start space-x-4">
                    {/* Vehicle Image with better fallback handling */}
                    <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {rental.vehicle?.images && rental.vehicle.images.length > 0 ? (
                        <>
                            <img
                                src={constructImageUrl(rental.vehicle.images[0])}
                                alt={rental.vehicle?.vehicleName || 'Vehicle'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                console.log('Image failed to load, using fallback');
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const fallbackDiv = target.parentElement?.querySelector('.fallback-icon');
                                if (fallbackDiv) {
                                    (fallbackDiv as HTMLElement).style.display = 'flex';
                                }
                                }}
                            />
                            <div 
                                className="fallback-icon absolute inset-0 w-full h-full flex items-center justify-center text-gray-400"
                                style={{ display: 'none' }}
                            >
                                <Car className="w-8 h-8" />
                            </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Car className="w-8 h-8" />
                            </div>
                        )}
                      <div 
                        className="w-full h-full flex items-center justify-center text-gray-400"
                        style={{
                          display: rental.vehicle?.images && rental.vehicle.images.length > 0 ? 'none' : 'flex'
                        }}
                      >
                        <Car className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {rental.vehicle?.vehicleName || 'Unknown Vehicle'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        License: {rental.vehicle?.vehicleLicenseNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Owner: {rental.owner?.firstName} {rental.owner?.lastName}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(rental.pickupDate)} - {formatDate(rental.dropoffDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{calculateDuration(rental.pickupDate, rental.dropoffDate)} days</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {rental.pickupLocation} → {rental.dropoffLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col lg:items-end space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(rental.bookingStatus)}`}>
                        {getStatusIcon(rental.bookingStatus)}
                        <span className="ml-1 capitalize">{rental.bookingStatus}</span>
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(rental.paymentStatus)}`}>
                        <CreditCard className="w-4 h-4 mr-1" />
                        <span className="capitalize">{rental.paymentStatus}</span>
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${rental.totalAmount}</p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/vehicle/${rental.vehicle?._id}`}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Link>
                      
                      {rental.bookingStatus === 'completed' && (
                        <Link
                          to={`/vehicle/${rental.vehicle?._id}`}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Book Again</span>
                        </Link>
                      )}
                      
                      {rental.paymentStatus === 'paid' && (
                        <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400">
                      Booked on {formatDate(rental.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {rentalHistory.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Records: {rentalHistory.length}</span>
              <span>Showing: {filteredHistory.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalHistoryTab;