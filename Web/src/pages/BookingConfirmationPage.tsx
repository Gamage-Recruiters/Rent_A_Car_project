import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Car, Phone, Mail, Download, Share2, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    previousAutoTable: { finalY: number };
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  
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
  
  const getCustomerName = () => {
  // Check if customer is a populated object with firstName
  if (booking.customer && typeof booking.customer === 'object' && booking.customer.firstName) {
    return `${booking.customer.firstName || ''} ${booking.customer.lastName || ''}`;
  }
  
  // Check if customer info is directly on booking
  if (booking.customerName) {
    return booking.customerName;
  }
  
  // Check if customer is an ID and use logged-in user as fallback
  if (user) {
    return `${user.firstName || ''} ${user.lastName || ''}`;
  }
  
  return 'N/A';
};

// Get customer email with fallbacks
const getCustomerEmail = () => {
  // Check if customer is a populated object with email
  if (booking.customer && typeof booking.customer === 'object' && booking.customer.email) {
    return booking.customer.email;
  }
  
  // Check if email is directly on booking
  if (booking.customerEmail) {
    return booking.customerEmail;
  }
  
  // Use logged-in user as fallback
  if (user && user.email) {
    return user.email;
  }
  
  return 'N/A';
};

  // Function to generate and download PDF receipt
  const downloadReceipt = () => {
    if (!booking || !vehicle || !owner) {
      console.error('Cannot generate receipt: booking data is missing');
      return;
    }
    
    try {
      setDownloadingReceipt(true);
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('BOOKING RECEIPT', pageWidth / 2, 20, { align: 'center' });
      
      // Add confirmation code and date
      doc.setFontSize(12);
      doc.text(`Confirmation: ${confirmationCode}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 36, { align: 'center' });
      
      // Add line
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 40, pageWidth - 20, 40);
      
      // Customer information
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Customer Information', 20, 50);
      
      doc.setFontSize(10);
      doc.text(`Name: ${getCustomerName()}`, 20, 58);
      doc.text(`Email: ${getCustomerEmail()}`, 20, 65);

      // Vehicle Information
      doc.setFontSize(14);
      doc.text('Vehicle Details', 20, 80);
      
      doc.setFontSize(10);
      doc.text(`Vehicle: ${vehicle.vehicleName || `${vehicle.brand} ${vehicle.model}`}`, 20, 88);
      doc.text(`Type: ${vehicle.vehicleType || ''}`, 20, 95);
      doc.text(`License: ${vehicle.vehicleLicenseNumber || ''}`, 20, 102);
      
      // Booking Details
      doc.setFontSize(14);
      doc.text('Booking Details', 20, 117);
      
      // Use autoTable for booking details
      autoTable(doc, {
        startY: 125,
        head: [['Description', 'Details']],
        body: [
          ['Booking ID', booking._id],
          ['Pickup Date', formatDate(booking.pickupDate)],
          ['Dropoff Date', formatDate(booking.dropoffDate)],
          ['Pickup Location', booking.pickupLocation],
          ['Dropoff Location', booking.dropoffLocation],
          ['Duration', `${calculateDays()} days`],
          ['Status', booking.bookingStatus.toUpperCase()],
          ['Payment Status', booking.paymentStatus.toUpperCase()]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontStyle: 'bold'
        }
      });
      
      // Calculate current Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      
      // Payment Summary
      doc.setFontSize(14);
      doc.text('Payment Summary', 20, finalY);
      
      autoTable(doc, {
        startY: finalY + 8,
        head: [['Item', 'Amount']],
        body: [
          ['Daily Rate', `$${vehicle.pricePerDay || 0}`],
          ['Number of Days', `${calculateDays()}`],
          ['Subtotal', `$${(vehicle.pricePerDay || 0) * calculateDays()}`],
          ['Taxes & Fees', `$${booking.totalAmount - ((vehicle.pricePerDay || 0) * calculateDays())}`],
          ['Total Amount', `$${booking.totalAmount}`]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        foot: [['Total Paid', `$${booking.totalAmount}`]],
        footStyles: {
          fillColor: [243, 244, 246], // Light gray
          textColor: 0,
          fontStyle: 'bold'
        }
      });
      
      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This is an electronic receipt. No signature required.', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // Save the PDF
      doc.save(`Receipt-${confirmationCode}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate receipt. Please try again.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

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
                  <button 
                    onClick={downloadReceipt}
                    disabled={downloadingReceipt}
                    className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 ${
                      downloadingReceipt ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {downloadingReceipt ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download Receipt</span>
                      </>
                    )}
                  </button>
                  
                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <Share2 className="w-5 h-5" />
                    <span>Share Booking</span>
                  </button>
                  
                  <Link
                    to="/booking-tab"
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