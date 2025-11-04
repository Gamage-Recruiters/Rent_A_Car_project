import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'user' | 'owner'|'admin') => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  forgotPassword: (email: string, userType?: 'user' | 'admin') => Promise<boolean>;
  resetPassword: (token: string, newPassword: string, userType?: 'user' | 'admin') => Promise<boolean>;
  updateUserData: (userData: any) => void;
  checkAuthStatus: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize axios with credentials
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = API_URL.replace('/api', ''); 

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Always try to check /me endpoint for customer (user) type
      let userType: 'user' | 'owner' | 'admin' = 'user';
      let endpoint = '';
      // Try to get user type from localStorage, fallback to 'user'
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.type) userType = parsedUser.type;
        } catch (error) {
          localStorage.removeItem('user');
        }
      }
      if (userType === 'admin') {
        endpoint = `${API_URL}/admin/profile`;
      } else if (userType === 'owner') {
        endpoint = `${API_URL}/owner/profile`;
      } else {
        endpoint = `${API_URL}/auth/customer/me`;
      }
      try {
        const response = await axios.get(endpoint, { withCredentials: true });
        // For /me endpoint, user is in response.data.user
        const userData = response.data.user || response.data.data;
        if (userData) {
          const updatedUser: User = {
            id: userData._id,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName || ''}`.trim(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phoneNumber || userData.phone,
            phoneNumber: userData.phoneNumber,
            photo: userData.photo,
            type: userType as 'user' | 'owner' | 'admin',
            createdAt: userData.createdAt,
            dateOfBirth: userData.dateOfBirth,
            driversLicense: userData.driversLicense,
            emergencyContact: userData.emergencyContact,
            address: userData.address,
            isNewsletterSubscribed: userData.isNewsletterSubscribed,
            googleId: userData.googleId,
            userRole: userData.userRole,
            image: userData.image
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return true;
        }
        return false;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('user');
          setUser(null);
          return false;
        }
        setUser(null);
        localStorage.removeItem('user');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Add refreshUser here
  const refreshUser = async () => {
    try {
      await checkAuthStatus();
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  // Initialize auth status on app load
  useEffect(() => {
    // Always check auth status on load (for Google login, etc.)
    checkAuthStatus();
  }, []);

  const updateUserData = (userData: any) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      // Create the updated user object with proper structure
      const updatedUser: User = {
        ...prevUser,
        // Update basic fields
        firstName: userData.firstName || prevUser.firstName,
        lastName: userData.lastName || prevUser.lastName,
        email: userData.email || prevUser.email,
        phoneNumber: userData.phoneNumber || prevUser.phoneNumber,
        phone: userData.phoneNumber || userData.phone || prevUser.phone,
        photo: userData.photo || prevUser.photo,
        dateOfBirth: userData.dateOfBirth || prevUser.dateOfBirth,
        driversLicense: userData.driversLicense || prevUser.driversLicense,
        emergencyContact: userData.emergencyContact || prevUser.emergencyContact,
        address: userData.address || prevUser.address,
        isNewsletterSubscribed: userData.isNewsletterSubscribed !== undefined 
          ? userData.isNewsletterSubscribed 
          : prevUser.isNewsletterSubscribed,
        // Update name based on first and last name
        name: `${userData.firstName || prevUser.firstName} ${userData.lastName || prevUser.lastName || ''}`.trim(),
        // Preserve image object if it exists
        image: userData.image || prevUser.image
      };
      
      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  };

  // ...existing code for login, signup, logout, forgotPassword...
  const login = async (email: string, password: string, userType: 'user' | 'owner' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if(userType === 'user') {
        response = await axios.post(`${API_URL}/auth/customer/login`, { email, password });
      } else if(userType === 'owner') {
        response = await axios.post(`${API_URL}/auth/owner/login`, { email, password });
      } else if(userType === 'admin') {
        response = await axios.post(`${API_URL}/auth/superadmin/login`, { email, password });
      } else {
        throw new Error('Invalid user type');
      }

      if (response.data) {
        // Store the user type in localStorage before checking auth status
        // This ensures checkAuthStatus knows which profile endpoint to use
        const baseUser = { type: userType };
        localStorage.setItem('user', JSON.stringify(baseUser));
        
        // Now fetch complete profile data
        await checkAuthStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Login failed');
      } else {
        setError('An error occurred during login');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt'>, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;

      if (userData.type === 'user') {
        response = await axios.post(`${API_URL}/auth/customer/register`, {
          email: userData.email,
          password,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || ''
        });
      } else if (userData.type === 'owner') {
        response = await axios.post(`${API_URL}/auth/owner/register`, {
          email: userData.email,
          password,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || ''
        });
      } else {
        throw new Error('Invalid user type for signup');
      }

      if (response.data) {
        // After successful signup, fetch complete profile data
        await checkAuthStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Signup failed');
      } else {
        setError('An error occurred during signup');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      if (user?.type === 'user') {
        response = await axios.post(`${API_URL}/auth/customer/logout`);
      } else if (user?.type === 'owner') {
        response = await axios.get(`${API_URL}/auth/owner/logout`);
      } else if (user?.type === 'admin') {
        response = await axios.post(`${API_URL}/auth/superadmin/logout`);
      }else {
        setUser(null);
        localStorage.removeItem('user');
        return true;
      }
      
      if (response && response.data) {
        setUser(null);
        localStorage.removeItem('user');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.removeItem('user');
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string, userType: 'user' | 'admin' = 'user'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if (userType === 'admin') {
        response = await axios.post(`${API_URL}/auth/superadmin/forgot-password`, { email });
      } else if (userType === 'user') {
        response = await axios.post(`${API_URL}/auth/customer/forgot-password`, { email });
      } else {
        throw new Error('Forgot password is only available for users and admins');
      }
      
      return response.data.success;
    } catch (error) {
      console.error('Forgot password error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Forgot password failed');
      } else {
        setError('An error occurred during forgot password');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string, userType: 'user' | 'admin' = 'user'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (userType === 'admin') {
        response = await axios.post(`${API_URL}/auth/superadmin/reset-password`, { token, newPassword });
      } else if (userType === 'user') {
        response = await axios.post(`${API_URL}/auth/customer/reset-password`, { token, newPassword });
      } else {
        throw new Error('Password reset is only available for users and admins');
      }
      
      return response.data.success;
    } catch (error) {
      console.error('Reset password error:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Reset password failed');
      } else {
        setError('An error occurred during reset password');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoading,
      error,
      forgotPassword,
      updateUserData,
      resetPassword,
      checkAuthStatus,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
