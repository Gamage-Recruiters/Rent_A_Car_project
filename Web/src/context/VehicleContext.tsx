import React, { createContext, useContext } from 'react'
import axios from 'axios';
import { Vehicle } from '../types';

interface VehicleContextType {
  getAllVehicles: (filters?: any) => Promise<Vehicle[]>;
  searchVehicles: (query: string) => Promise<Vehicle[]>;
  getVehicleById: (id: string) => Promise<Vehicle | null>;
  getVehiclesByOwner: () => Promise<Vehicle[]>;
  getOwnerVehicleById: (id: string) => Promise<Vehicle | null>;
  updateVehicle: (id: string, data: FormData) => Promise<any>;
  deleteVehicle: (id: string) => Promise<void>;
  registerVehicle: (data: FormData) => Promise<any>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const ownerBaseUrl = 'http://localhost:8000/api/owner/'

  const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/customer/vehicle', 
    withCredentials: true,
  });

    const ownerapi = axios.create({
    baseURL: ownerBaseUrl + "vehicle",
    withCredentials: true,
  });

  const getAllVehicles = async (filters: any = {}) => {
    try {
      console.log('VehicleContext: Making API call to:', api.defaults.baseURL);
      console.log('VehicleContext: Filters:', filters);
      const res = await api.get('/', { params: filters });
      console.log('VehicleContext: API response:', res.data);
      return res.data.data;
    } catch (error) {
      console.error('VehicleContext: Error in getAllVehicles:', error);
      throw error;
    }
  };

  const searchVehicles = async (query: string) => {
    const res = await api.get('/search', { params: { query } });
    return res.data.data;
  };

  const getVehicleById = async (id: string) => {
    const res = await api.get(`/${id}`);
    return res.data.data;
  };

  const getVehiclesByOwner = async () => {
    const res = await ownerapi.get('/all');
    return res.data.data;
  };

  const getOwnerVehicleById = async (id: string) => {
    const res = await ownerapi.get(`/${id}`);
    return res.data.data;
  };

  const updateVehicle = async (id: string, data: FormData) => {
    return await ownerapi.put(`/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const deleteVehicle = async (id: string) => {
    await ownerapi.delete(`/${id}`);
  };

  const registerVehicle = async (data: FormData) => {
    return await ownerapi.post("/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  return (
    <VehicleContext.Provider value={{ getAllVehicles, searchVehicles, getVehicleById, registerVehicle, getVehiclesByOwner, deleteVehicle, getOwnerVehicleById, updateVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used inside VehicleProvider');
  }
  return context;
};
