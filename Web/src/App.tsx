import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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

import ManageAccounts from './pages/ManageAccounts';

import AdminTestPage from './pages/AdminTestPage';
import PlatformSettingsPage from './pages/AdminPlatformSettings';

import AdminVehicleListingsPage from './pages/AdminVehicleListingsPage';
import AdminVehicleDetailsPage from './pages/AdminVehicleDetailsPage';

import AdminLogin from './pages/Auth/AdminLogin';
import AdminDashboard from './pages/Dashboard/AdminDashboard';



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          
          <Routes>
            <Route path="/admin-test" element={<AdminTestPage />} /> {/* Admin sidebar test page */}
            
            
          
          </Routes>
          <Navbar />
          <Routes>
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

            <Route path='/manage-accounts' element={<ManageAccounts />} />

            {/* admin pages */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-vehicle-listings" element={<AdminVehicleListingsPage />} />
            <Route path="/admin/vehicles/:id" element={<AdminVehicleDetailsPage />} />
            <Route path="/admin/settings" element={<PlatformSettingsPage />} />
            
            
            {/* Fallback route */}


          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;