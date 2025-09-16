import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Users, Fuel, Settings, MapPin, Phone, Mail, Calendar, 
  Shield, Award, Clock, ArrowLeft, Heart, Share2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Vehicle } from '../types';
import { useVehicle } from '../context/VehicleContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '');

const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getVehicleById } = useVehicle();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchVehicle();
    fetchVehicleReviews();
  }, [id]);

  const fetchVehicle = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await getVehicleById(id);
      setVehicle(data);
    } catch (err) {
      setError('Failed to load vehicle details');
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleReviews = async () => {
    if (!id) return;

    setReviewsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/customer/review/vehicle/${id}`);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/vehicle/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  const calculateTotalPrice = () => {
    if (!vehicle || !bookingDates.startDate || !bookingDates.endDate) return 0;
    
    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return days * vehicle.pricePerDay;
  };

  const maskPhone = (p?: string | number) => {
    if (!p) return 'N/A';
    const digits = p.toString().replace(/\D/g, '');
    return digits.length > 2 ? `••• •• •• ${digits.slice(-2)}` : '•••';
  };

  const maskEmail = (e?: string) => {
    if (!e) return 'N/A';
    const [name, domain] = e.split('@');
    if (!domain) return '••••@••••';
    const maskedName = name.length <= 2 ? '••' : `${name[0]}••${name[name.length - 1]}`;
    return `${maskedName}@${domain}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The vehicle you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const owner = {
    name: vehicle.owner?.firstName && vehicle.owner?.lastName 
      ? `${vehicle.owner.firstName} ${vehicle.owner.lastName}`
      : 'Owner',
    phone: vehicle.phoneNumber?.toString(),
    email: vehicle.owner?.email,
    address: vehicle.pickupAddress,
    verified: true,
  };

  const constructImageUrl = (imagePath?: string) => {
  if (!imagePath) return '/placeholder-car.jpg';
  
  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /uploads, just add the base URL
  if (imagePath.startsWith('/uploads')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Otherwise, construct the path to the vehicles folder
  return `${BASE_URL}/uploads/vehicles/${imagePath}`;
};

// images variable definition
const images = vehicle.images && vehicle.images.length > 0 
  ? vehicle.images.map(img => constructImageUrl(img))
  : ['https://via.placeholder.com/600x400?text=No+Image+Available'];

  
  const vehicleName = vehicle.vehicleName || 'Vehicle';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[selectedImage]}
                alt={vehicleName}
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
                <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${vehicleName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {vehicleName}
                </h1>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{vehicle.rating || 0}</span>
                  <span className="text-gray-500">({vehicle.reviewCount || 0} reviews)</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.pickupAddress}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {vehicle.vehicleType?.charAt(0).toUpperCase() + vehicle.vehicleType?.slice(1)}
                </span>
                {vehicle.isDriverAvailable && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Driver Available
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Owner Details</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {owner.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{owner.name}</span>
                      {owner.verified && (
                        <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs">
                          <Shield className="w-3 h-3 mr-1" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>{(user || showBookingModal) ? (owner.phone || 'N/A') : maskPhone(owner.phone)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>{(user || showBookingModal) ? (owner.email || 'N/A') : maskEmail(owner.email)}</span>
                </div>
                <div className="flex items-center space-x-3 col-span-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>{owner.address || '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Vehicle Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.noSeats || 'N/A'} Seats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.fuelType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.transmission}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>{vehicle.year}</span>
                </div>
              </div>
            </div>

            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Per Day</span>
                  <span className="text-2xl font-bold text-blue-600">${vehicle.pricePerDay}</span>
                </div>
                {vehicle.pricePerDistance && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Per Kilometer</span>
                    <span className="text-lg font-semibold text-blue-600">${vehicle.pricePerDistance}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleBooking}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              {user ? 'Book Now' : 'Login to Book'}
            </button>
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">About This Vehicle</h3>
            <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
          </div>
        )}

        {/* Contact Information */}
        {(user || showBookingModal) && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>{owner.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>{owner.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-3 col-span-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>{owner.address || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>
          {reviewsLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review this vehicle!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                        {review.customer?.firstName ? review.customer.firstName.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="font-medium">
                          {review.customer?.firstName || 'Anonymous'} {review.customer?.lastName || ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Book {vehicleName}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bookingDates.startDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={bookingDates.endDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={bookingDates.notes}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any special requests or notes..."
                />
              </div>
              
              {bookingDates.startDate && bookingDates.endDate && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${calculateTotalPrice()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Booking submitted successfully!');
                  setShowBookingModal(false);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsPage;