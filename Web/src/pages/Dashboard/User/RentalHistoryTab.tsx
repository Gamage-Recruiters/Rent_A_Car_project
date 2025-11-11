import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, MapPin, User, Calendar, Car,
  Search, Eye, Download, RotateCcw, CheckCircle,
  XCircle, AlertCircle, CreditCard, RefreshCw
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user) {
      fetchRentalHistory();
    } else {
      setLoading(false);
    }
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [user]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset to first page on filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter, dateRange]);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const response = await axios.get(`${API_URL}/customer/rental-history`, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal as any,
      });
      if (response.data?.success) {
        setRentalHistory(response.data.data || []);
      } else {
        setError('Failed to fetch rental history - API returned success: false');
      }
    } catch (err) {
      if (axios.isCancel(err)) return; // aborted
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          toast.error('Authentication failed. Please log in again.');
        } else if (err.response?.status === 404) {
          setError('Rental history endpoint not found.');
          toast.error('Rental history endpoint not found');
        } else {
          const msg = err.response?.data?.message || err.message || 'Failed to fetch rental history';
          setError(msg);
          toast.error(msg);
        }
      } else {
        setError('Network error occurred');
        toast.error('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const constructImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder-car.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${BASE_URL}${imagePath}`;
    if (imagePath.includes('uploads/')) return `${BASE_URL}/${imagePath}`;
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
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const calculateDuration = (pickup: string, dropoff: string) => {
    const diff = new Date(dropoff).getTime() - new Date(pickup).getTime();
    return Math.max(1, Math.ceil(diff / 86400000));
  };

  const filteredHistory = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return rentalHistory.filter(r => {
      if (!r) return false;
      const matchesSearch =
        r.vehicle?.vehicleName?.toLowerCase().includes(s) ||
        r.pickupLocation?.toLowerCase().includes(s) ||
        r.dropoffLocation?.toLowerCase().includes(s) ||
        r.owner?.firstName?.toLowerCase().includes(s) ||
        r.owner?.lastName?.toLowerCase().includes(s);
      if (!matchesSearch) return false;
      if (!(statusFilter === 'all' || r.bookingStatus === statusFilter)) return false;
      if (!(paymentFilter === 'all' || r.paymentStatus === paymentFilter)) return false;
      if (dateRange !== 'all') {
        const created = new Date(r.createdAt).getTime();
        const age = Date.now() - created;
        if (dateRange === 'week' && age > 7 * 86400000) return false;
        if (dateRange === 'month' && age > 30 * 86400000) return false;
        if (dateRange === 'year' && age > 365 * 86400000) return false;
      }
      return true;
    });
  }, [rentalHistory, debouncedSearch, statusFilter, paymentFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, page]);

  // Auth gate
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please log in to view your rental history.</p>
            <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
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
          <button onClick={fetchRentalHistory} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Rental History</h3>
            <p className="text-gray-600">Your complete rental transaction history</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search rentals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
            </select>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">{rentalHistory.length === 0 ? 'No Rental History' : 'No Matching Records'}</h3>
            <p className="text-gray-600 mb-4">
              {rentalHistory.length === 0 ? "You haven't rented any vehicles yet." : 'No rental records match your current filters.'}
            </p>
            <Link to="/search" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Find Vehicles</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentPageData.map(rental => (
              <div key={rental._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {rental.vehicle?.images?.[0] ? (
                        <img
                          src={constructImageUrl(rental.vehicle.images[0])}
                          alt={rental.vehicle?.vehicleName || 'Vehicle'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Car className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{rental.vehicle?.vehicleName || 'Unknown Vehicle'}</h4>
                      <p className="text-sm text-gray-600">License: {rental.vehicle?.vehicleLicenseNumber || 'N/A'}</p>
                      <p className="text-sm text-gray-500">Owner: {rental.owner?.firstName} {rental.owner?.lastName}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1"><Calendar className="w-4 h-4" /><span>{formatDate(rental.pickupDate)} - {formatDate(rental.dropoffDate)}</span></div>
                        <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{calculateDuration(rental.pickupDate, rental.dropoffDate)} days</span></div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{rental.pickupLocation} → {rental.dropoffLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:items-end space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(rental.bookingStatus)}`}>{getStatusIcon(rental.bookingStatus)}<span className="ml-1 capitalize">{rental.bookingStatus}</span></span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(rental.paymentStatus)}`}><CreditCard className="w-4 h-4 mr-1" /><span className="capitalize">{rental.paymentStatus}</span></span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${rental.totalAmount}</p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/vehicle/${rental.vehicle?._id}`} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"><Eye className="w-4 h-4" /><span>View</span></Link>
                      {rental.bookingStatus === 'completed' && (
                        <Link to={`/vehicle/${rental.vehicle?._id}`} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"><RotateCcw className="w-4 h-4" /><span>Book Again</span></Link>
                      )}
                      {rental.paymentStatus === 'paid' && (
                        <button className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1"><Download className="w-4 h-4" /><span>Receipt</span></button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Booked on {formatDate(rental.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredHistory.length > pageSize && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={`px-3 py-2 rounded-lg border ${page === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >Prev</button>
            <span className="text-gray-600">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className={`px-3 py-2 rounded-lg border ${page === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >Next</button>
          </div>
        )}

        {/* Summary */}
        {rentalHistory.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Records: {rentalHistory.length}</span>
              <span>Filtered: {filteredHistory.length}</span>
              <span>Showing page {page}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalHistoryTab;