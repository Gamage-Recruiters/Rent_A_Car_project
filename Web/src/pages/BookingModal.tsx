import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Vehicle } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

interface BookingModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ vehicle, onClose }) => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: vehicle.pickupAddress || vehicle.location || '',
    dropoffLocation: vehicle.pickupAddress || vehicle.location || '',
    notes: ''
  });
  
  const [idDocuments, setIdDocuments] = useState<File[]>([]);
  const [licenseDocuments, setLicenseDocuments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return days * vehicle.pricePerDay;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setIdDocuments(filesArray);
      
      if (errors.idDocuments) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.idDocuments;
          return newErrors;
        });
      }
    }
  };

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setLicenseDocuments(filesArray);
      
      if (errors.licenseDocuments) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.licenseDocuments;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bookingData.startDate) newErrors.startDate = 'Start date is required';
    if (!bookingData.endDate) newErrors.endDate = 'End date is required';
    if (!bookingData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
    if (!bookingData.dropoffLocation) newErrors.dropoffLocation = 'Drop-off location is required';
    
    if (idDocuments.length < 2) newErrors.idDocuments = 'Please upload front and back of your ID';
    if (licenseDocuments.length < 2) newErrors.licenseDocuments = 'Please upload front and back of your driving license';
    
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
      
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const totalAmount = calculateTotalPrice();
    if (totalAmount <= 0) {
      setErrors(prev => ({ ...prev, general: 'Invalid booking duration' }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('vehicle', vehicle._id || vehicle.id);
      formData.append('owner', vehicle.ownerId || vehicle.owner?._id || '');
      formData.append('pickupLocation', bookingData.pickupLocation);
      formData.append('dropoffLocation', bookingData.dropoffLocation);
      formData.append('pickupDate', bookingData.startDate);
      formData.append('dropoffDate', bookingData.endDate);
      formData.append('totalAmount', totalAmount.toString());
      formData.append('notes', bookingData.notes);
      
      // Append ID documents
      idDocuments.forEach(file => {
        formData.append('customerIdImage', file);
      });
      
      // Append license documents
      licenseDocuments.forEach(file => {
        formData.append('customerLicenseImage', file);
      });
      
      const response = await axios.post(
        `${API_URL}/customer/booking/create`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data?.success) {
        toast.success('Booking created successfully');
        navigate(`/booking-confirmation/${response.data.booking._id}`);
      } else {
        setErrors({ general: response.data?.message || 'Failed to create booking' });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      
      if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.message || 'Failed to create booking. Please try again.' });
      } else {
        setErrors({ general: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Book {vehicle.vehicleName}</h3>
        
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{errors.general}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={bookingData.startDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.startDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={bookingData.endDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.endDate ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                min={bookingData.startDate || new Date().toISOString().split('T')[0]}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Location *
            </label>
            <input
              type="text"
              name="pickupLocation"
              value={bookingData.pickupLocation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.pickupLocation ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter pickup location"
            />
            {errors.pickupLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.pickupLocation}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop-off Location *
            </label>
            <input
              type="text"
              name="dropoffLocation"
              value={bookingData.dropoffLocation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.dropoffLocation ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter drop-off location"
            />
            {errors.dropoffLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.dropoffLocation}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload ID (Front & Back) *
            </label>
            <div className={`border ${errors.idDocuments ? 'border-red-300' : 'border-gray-300'} rounded-lg p-4`}>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload front and back of your ID card (PNG, JPG, PDF)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={handleIdUpload}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </label>
              </div>
              {idDocuments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{idDocuments.length} file(s) selected</p>
                  <ul className="mt-1 text-xs text-gray-500">
                    {idDocuments.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {errors.idDocuments && (
              <p className="mt-1 text-sm text-red-600">{errors.idDocuments}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Driving License (Front & Back) *
            </label>
            <div className={`border ${errors.licenseDocuments ? 'border-red-300' : 'border-gray-300'} rounded-lg p-4`}>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload front and back of your driving license (PNG, JPG, PDF)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    onChange={handleLicenseUpload}
                    accept=".jpg,.jpeg,.png,.pdf"
                  />
                </label>
              </div>
              {licenseDocuments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{licenseDocuments.length} file(s) selected</p>
                  <ul className="mt-1 text-xs text-gray-500">
                    {licenseDocuments.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {errors.licenseDocuments && (
              <p className="mt-1 text-sm text-red-600">{errors.licenseDocuments}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={bookingData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Any special requests or notes..."
            />
          </div>
          
          {bookingData.startDate && bookingData.endDate && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Cost:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${calculateTotalPrice()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                For {Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          )}

          <div className="flex space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;