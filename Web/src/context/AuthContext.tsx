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
  forgotPassword: (email: string) => Promise<boolean>;
  updateUserData: (userData: any) => void;
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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const updateUserData = (userData: any) => {
    setUser(prevUser => {
      if (!prevUser) return userData;
      
      const updatedUser = { ...prevUser, ...userData };
      
      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  };

  const login = async (email: string, password: string, userType: 'user' | 'owner' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      if(userType === 'user') {
        response = await axios.post(`${API_URL}/auth/customer/login`, { email, password });
      } else if(userType === 'owner') {
        response = await axios.post(`${API_URL}/auth/owner/login`, { email, password });
      } else {
        throw new Error('Admin login not implemented');
      }

      if (response.data) {
        const userData: User = {
          id: response.data.id || 'unknown',
          email,
          name: response.data.firstName ? `${response.data.firstName} ${response.data.lastName || ''}` : email.split('@')[0],
          type: userType,
          createdAt: new Date().toISOString(),
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
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
        // Customer signup
        response = await axios.post(`${API_URL}/auth/customer/register`, {
          email: userData.email,
          password,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || ''
        });
      } else if (userData.type === 'owner') {
        // Owner signup
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

        const newUser: User = {
          id: response.data.id || 'unknown',
          email: userData.email,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || '',
          type: userData.type,
          createdAt: new Date().toISOString(),
        };

        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
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
      // Determine which logout endpoint to use based on user type
      let response;
      if (user?.type === 'user') {
        response = await axios.post(`${API_URL}/auth/customer/logout`);
      } else if (user?.type === 'owner') {
        response = await axios.get(`${API_URL}/auth/owner/logout`);
      } else {
        // If user type is unknown or not logged in, just clear local storage
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
      // Even if the API call fails, we should still clear the local state
      setUser(null);
      localStorage.removeItem('user');
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/customer/forgot-password`, { email });
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

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isLoading,
      error,
      forgotPassword,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};