import React from 'react';
import { ToastContainer } from 'react-toastify';
import { AdminProvider } from './context/AdminContext';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import UserDashboard from './pages/Dashboard/UserDashboard';
import OwnerDashboard from './pages/Dashboard/OwnerDashboard';
import AddVehiclePage from './pages/AddVehiclePage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ContactPage from './pages/ContactPage';
import ReviewsPage from './pages/ReviewsPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import WriteReview from './pages/WriteReview';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import ManageAccounts from './pages/ManageAccounts';

import AdminTestPage from './pages/AdminTestPage';
import PlatformSettingsPage from './pages/AdminPlatformSettings';

import AdminVehicleListingsPage from './pages/AdminVehicleListingsPage';
import AdminVehicleDetailsPage from './pages/AdminVehicleDetailsPage';

import AdminLogin from './pages/Auth/AdminLogin';
import AdminDashboard from './pages/Dashboard/AdminDashboard';

import AdminProfile from './pages/AdminProfile';

import AdminCustomerInquiry from './pages/AdminCustomerInquiry';
import AdminResetPasswordPage from './pages/Auth/AdminResetPasswordPage';




function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <AdminProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/admin-test" element={<AdminTestPage />} /> {/* Admin sidebar test page */}
            
          

          
          
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/vehicle/:id" element={<VehicleDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/add-vehicle" element={<AddVehiclePage />} />
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/write-review/:id" element={<WriteReview />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path='/manage-accounts' element={<ManageAccounts />} />

            {/* admin pages */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-vehicle-listings" element={<AdminVehicleListingsPage />} />
            <Route path="/admin/vehicles/:id" element={<AdminVehicleDetailsPage />} />
            <Route path="/admin/settings" element={<PlatformSettingsPage />} />

            <Route path="/admin/profile" element={<AdminProfile />} />

            <Route path="/admin/reset-password/:token" element={<AdminResetPasswordPage/>}/>
            

            <Route path="/admininquiries" element={<AdminCustomerInquiry />} />

            
            {/* Fallback route */}


          </Routes>
          <Footer />
        </div>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
      </AdminProvider>
      </VehicleProvider>
    </AuthProvider>
    
  );
}

export default App;