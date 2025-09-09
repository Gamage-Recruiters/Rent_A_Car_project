import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface FormData {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
const isAuthenticated = !!user;
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Prefill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailAddress: user.email || '',
        phoneNumber: user.phoneNumber || user.phone || '',
      }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.emailAddress.trim()) {
      errors.emailAddress = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      errors.emailAddress = 'Invalid email format';
    }
    
    if (!formData.subject) {
      errors.subject = 'Please select a subject';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    if (!isAuthenticated) {
      toast.info('Please log in to send a message');
      // Save form data to sessionStorage to restore after login
      sessionStorage.setItem('contactFormData', JSON.stringify(formData));
      navigate('/login?redirect=/contact');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      // Map form subject values to backend enum values
      const subjectMapping: Record<string, string> = {
        'booking': 'Booking Inquiry',
        'support': 'Customer Support',
        'partner': 'Become a Partner',
        'feedback': 'Feedback',
        'other': 'Other'
      };
      
      const response = await axios.post(
        `${API_URL}/customer/contact/submit-message`, 
        {
          ...formData,
          subject: subjectMapping[formData.subject] || formData.subject
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.success) {
        toast.success('Message sent successfully!');
        setSubmitSuccess(true);
        // Reset form fields except for user information
        setFormData(prev => ({
          firstName: prev.firstName,
          lastName: prev.lastName,
          emailAddress: prev.emailAddress,
          phoneNumber: prev.phoneNumber,
          subject: '',
          message: ''
        }));
      } else {
        toast.error(response.data?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(errorMessage);
        
        if (error.response?.status === 401) {
          toast.info('Please log in to continue');
          navigate('/login?redirect=/contact');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof FormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // const getNameFromFullName = (fullName: string): { firstName: string; lastName: string } => {
  //   const parts = fullName.trim().split(' ');
  //   return {
  //     firstName: parts[0] || '',
  //     lastName: parts.slice(1).join(' ') || ''
  //   };
  // };

  // Handle legacy name field for full name
  // const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = e.target;
  //   const { firstName, lastName } = getNameFromFullName(value);
    
  //   setFormData(prev => ({
  //     ...prev,
  //     firstName,
  //     lastName
  //   }));
    
  //   // Clear first name error
  //   if (formErrors.firstName) {
  //     setFormErrors(prev => ({
  //       ...prev,
  //       firstName: undefined
  //     }));
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have questions about our services? Need help with your booking? 
            We're here to help you every step of the way.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">+1 (555) 987-6543</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">support@rentacar.com</p>
                    <p className="text-gray-600">info@rentacar.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">123 Main Street</p>
                    <p className="text-gray-600">Downtown, City 12345</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p className="text-gray-600">Saturday - Sunday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">How do I book a vehicle?</h4>
                  <p className="text-gray-600 text-sm">Search for available vehicles, select your preferred car, and complete the booking process online.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">What documents do I need?</h4>
                  <p className="text-gray-600 text-sm">You'll need a valid driver's license, ID, and a credit card for the security deposit.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Can I modify my booking?</h4>
                  <p className="text-gray-600 text-sm">Yes, you can modify your booking up to 24 hours before your rental period starts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                <Info className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700">
                    You need to be logged in to send a message. Please{' '}
                    <button 
                      onClick={() => navigate('/login?redirect=/contact')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      log in
                    </button>{' '}
                    or{' '}
                    <button 
                      onClick={() => navigate('/register?redirect=/contact')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      register
                    </button>{' '}
                    to continue.
                  </p>
                </div>
              </div>
            )}
            
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Message Sent Successfully!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Thank you for contacting us. We'll get back to you as soon as possible.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Your first name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  required
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.emailAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="your@email.com"
                />
                {formErrors.emailAddress && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.emailAddress}</p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select a subject</option>
                  <option value="booking">Booking Inquiry</option>
                  <option value="support">Customer Support</option>
                  <option value="partner">Become a Partner</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.subject && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Tell us how we can help you..."
                />
                {formErrors.message && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!isAuthenticated && !formData.message)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;