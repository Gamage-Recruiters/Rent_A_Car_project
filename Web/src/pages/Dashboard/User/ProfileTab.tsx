import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const ProfileTab = () => {
  const { user, updateUserData, checkAuthStatus } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    driversLicense: user?.driversLicense || '',
    emergencyContact: user?.emergencyContact || '',
    address: user?.address || '',
    isNewsletterSubscribed: user?.isNewsletterSubscribed || false
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Debug user data
  useEffect(() => {
    console.log('Current user data:', user);
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        await checkAuthStatus(); // This will refresh the user data
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);
  
  // Helper function to construct proper image URL
  const constructImageUrl = (photoPath: string) => {
    if (!photoPath) return null;
    
    console.log('Original photo path:', photoPath);
    
    // If it's already a full URL, return as is
    if (photoPath.startsWith('http')) {
      console.log('Already full URL:', photoPath);
      return photoPath;
    }
    
    // If it starts with /uploads, construct the full URL
    if (photoPath.startsWith('/uploads')) {
      const fullUrl = `${BASE_URL}${photoPath}`;
      console.log('Constructed URL from /uploads:', fullUrl);
      return fullUrl;
    }
    
    // If it's just the filename, construct the full URL
    const fullUrl = `${BASE_URL}/uploads/customerProfiles/${photoPath}`;
    console.log('Constructed URL from filename:', fullUrl);
    return fullUrl;
  };

  // Update form data and image preview when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        dateOfBirth: user.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
        driversLicense: user.driversLicense || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
        isNewsletterSubscribed: user.isNewsletterSubscribed || false
      });

      // Handle the image preview from different possible sources
      let imageUrl = null;
      
      if (user.googleId && user.photo) {
        imageUrl = user.photo;
      } else if (user.photo) {
        imageUrl = constructImageUrl(user.photo);
      } else if (user.image?.url) {
        imageUrl = user.image.url;
      }
      
      console.log('Final image URL set:', imageUrl);
      setImagePreview(imageUrl);
    }
  }, [user]);

  // Helper function to format date string for input field
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      // Create preview URL for new image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = new FormData();
      
      // Add form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        // Skip email field for Google users
        if (key === 'email' && user?.googleId) {
          return;
        }
        
        if (value !== undefined && value !== null) {
          updateData.append(key, value.toString());
        }
      });

      // Add profile image if selected
      if (profileImage) {
        updateData.append('customerProfileImage', profileImage);
      }

      // Log the data being sent for debugging
      console.log('Submitting form data:', Object.fromEntries(updateData));

      const response = await axios.put(`${API_URL}/customer/profile`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      console.log('Profile update response:', response.data);

      if (response.data.success) {
        toast.success('Profile updated successfully');
        
        // Update the user context with new data
        if (updateUserData) {
          const userData = response.data.data;
          
          // Don't modify the photo URL here - let the useEffect handle it
          console.log('Updated user data:', userData);
          
          // Normalize the data format to match what the rest of the app expects
          if (userData.phoneNumber && !userData.phone) {
            userData.phone = userData.phoneNumber;
          }
          
          updateUserData(userData);
        }
        
        // Clear the selected file since it's now saved
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add error handling for image loading
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Failed to load image:', imagePreview);
    console.error('Image error event:', e);
    setImagePreview(null);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', imagePreview);
  };

  if (isLoadingProfile) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Profile Settings</h3>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Profile Image */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-300">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>
            <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </label>
            <input 
              id="profile-image" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>
          <div>
            <h4 className="font-medium">Profile Photo</h4>
            <p className="text-sm text-gray-500">Upload a new profile picture</p>
          </div>
        </div>

        {/* ...existing form fields... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                user?.googleId ? 'bg-gray-50' : ''
              }`}
              disabled={Boolean(user?.googleId)} 
            />
            {user?.googleId && (
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed for Google accounts</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phoneNumber">
              Phone
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dateOfBirth">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="driversLicense">
              Driver's License
            </label>
            <input
              id="driversLicense"
              name="driversLicense"
              type="text"
              value={formData.driversLicense}
              onChange={handleInputChange}
              placeholder="License number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="emergencyContact">
              Emergency Contact
            </label>
            <input
              id="emergencyContact"
              name="emergencyContact"
              type="tel"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              placeholder="Emergency contact number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your address"
          />
        </div>
        
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium mb-4">Preferences</h4>
          <div className="space-y-4">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                name="isNewsletterSubscribed"
                checked={formData.isNewsletterSubscribed}
                onChange={handleCheckboxChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <span className="ml-2 text-sm text-gray-700">Subscribe to newsletter and promotions</span>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileTab;