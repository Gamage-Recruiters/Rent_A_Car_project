// Web/src/pages/WriteReview.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '');

const WriteReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);

  // Check if this is an edit operation
  const isEditMode = location.state?.isEdit;
  const reviewId = location.state?.reviewId;

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast.error('You must be logged in to leave a review');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Fetch vehicle details if in ID is available
    if (id) {
      fetchVehicleDetails();
    }

    // If in edit mode, fetch the existing review
    if (isEditMode && reviewId) {
      fetchReviewDetails();
    }
  }, [id, user, isEditMode, reviewId]);

  const fetchVehicleDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/customer/vehicle/${id}`);
      if (response.data?.success) {
        setVehicleDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };

  const fetchReviewDetails = async () => {
    try {
      // Assuming you have an endpoint to get a specific review
      // If not, you might need to fetch all user reviews and filter
      const response = await axios.get(`${API_URL}/customer/review/my-reviews`, {
        withCredentials: true
      });
      
      if (response.data?.success) {
        const review = response.data.data.find(
          (r: any) => r._id === reviewId || r.id === reviewId
        );
        
        if (review) {
          setRating(review.rating || 0);
          setFeedback(review.comment || '');
        }
      }
    } catch (error) {
      console.error('Error fetching review details:', error);
      setError('Could not load review data. Please try again.');
    }
  };

  const validateForm = () => {
    if (rating === 0) {
      setError('Please select a rating');
      return false;
    }
    
    if (!feedback.trim()) {
      setError('Please provide feedback');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let response;
      
      if (isEditMode && reviewId) {
        // Update existing review
        response = await axios.put(
          `${API_URL}/customer/review/${reviewId}`,
          { rating, comment: feedback },
          { withCredentials: true }
        );
      } else {
        // Create new review
        response = await axios.post(
          `${API_URL}/customer/review`,
          { vehicle: id, rating, comment: feedback },
          { withCredentials: true }
        );
      }
      
      console.log('Review response:', response.data);
      
      if (response.data?.success) {
        setSuccess(true);
        toast.success(isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!');
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate(location.state?.returnTo || '/dashboard');
        }, 2000);
      } else {
        setError(response.data?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to submit review. Please try again.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => navigate(location.state?.returnTo || -1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {success ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditMode ? 'Review Updated!' : 'Review Submitted!'}
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for sharing your experience with us.
                </p>
                <button
                  onClick={() => navigate(location.state?.returnTo || '/dashboard')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditMode ? 'Update Your Review' : 'Rate Your Experience'}
                </h1>
                
                {vehicleDetails && (
                  <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
                    {vehicleDetails.images && vehicleDetails.images.length > 0 ? (
                      <img 
                        src={constructImageUrl(vehicleDetails.images[0])}
                        alt={vehicleDetails.vehicleName || 'Vehicle'}
                        className="w-26 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Image failed to load:', e.currentTarget.src);
                          e.currentTarget.src = '/placeholder-car.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{vehicleDetails.vehicleName || vehicleDetails.brand + ' ' + vehicleDetails.model}</h3>
                      <p className="text-sm text-gray-600">{vehicleDetails.brand} {vehicleDetails.model} {vehicleDetails.year}</p>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-600 mb-6">
                  Share your experience to help other renters make informed decisions
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating *</label>
                    <div className="flex items-center justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-full transition-colors ${
                            star <= rating 
                              ? 'bg-yellow-100 text-yellow-500' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Your Review *
                    </label>
                    <textarea
                      rows={4}
                      value={feedback}
                      onChange={(e) => {
                        setFeedback(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What did you like or dislike about your rental experience?"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => navigate(location.state?.returnTo || -1)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditMode ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        isEditMode ? 'Update Review' : 'Submit Review'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;