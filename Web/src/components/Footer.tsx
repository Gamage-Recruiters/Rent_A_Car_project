import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);
  
  const checkSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/customer/newsletter/status`, {
        withCredentials: true
      });
      
      if (response.data?.success) {
        setIsSubscribed(response.data.data.isNewsletterSubscribed);
        
        if (user?.email) {
          setEmail(user.email);
        }
      }
    } catch (error) {
      console.error('Error checking newsletter status:', error);
    }
  };
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      if (user) {
        const response = await axios.post(
          `${API_URL}/customer/newsletter/subscribe`, 
          {}, 
          { withCredentials: true }
        );
        
        if (response.data?.success) {
          setIsSubscribed(true);
          setShowSuccess(true);
          toast.success('Successfully subscribed to our newsletter!');
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            setShowSuccess(false);
          }, 5000);
        }
      } else {
        sessionStorage.setItem('newsletterEmail', email);
        toast.info('Please sign up or log in to complete your newsletter subscription');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || 'Failed to subscribe. Please try again.');
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };
  
  // Handle newsletter unsubscribe
  const handleUnsubscribe = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/customer/newsletter/unsubscribe`, 
        {}, 
        { withCredentials: true }
      );
      
      if (response.data?.success) {
        setIsSubscribed(false);
        toast.success('Successfully unsubscribed from our newsletter');
      }
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || 'Failed to unsubscribe. Please try again.');
      } else {
        toast.error('Something went wrong. Please try again later.');
      }
    }
  };

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'How It Works', path: '/help' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Safety', path: '/safety' },
      { label: 'Trust & Safety', path: '/trust' },
    ],
    legal: [
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'Insurance', path: '/insurance' },
    ],
    services: [
      { label: 'Rent a Car', path: '/search' },
      { label: 'List Your Car', path: '/signup?type=owner' },
      { label: 'Business Rentals', path: '/business' },
      { label: 'Gift Cards', path: '/gift-cards' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/rentacar', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/rentacar', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/rentacar', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/rentacar', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Car className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold">RentACar</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The world's largest car sharing marketplace. Rent the perfect car for any trip, 
              from trusted hosts around the world.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">support@rentacar.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">123 Main St, Downtown</span>
              </div>
              
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400">
                Get the latest news, updates, and exclusive offers delivered to your inbox.
              </p>
            </div>
            
            {/* Newsletter Form */}
            <div>
              {showSuccess ? (
                <div className="bg-green-800 bg-opacity-20 border border-green-700 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-green-400 font-medium">Successfully subscribed!</p>
                      <p className="text-gray-400 text-sm mt-1">Thank you for subscribing to our newsletter.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSuccess(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : isSubscribed ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-400">You're subscribed with {user?.email}</span>
                    </span>
                    <button 
                      onClick={handleUnsubscribe}
                      className="text-gray-400 hover:text-white text-sm underline ml-2"
                    >
                      Unsubscribe
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © {currentYear} RentACar. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Made with ❤️ for car sharing enthusiasts
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;