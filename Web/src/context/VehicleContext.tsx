import React, { createContext, useContext } from 'react'
import axios from 'axios';
import { Vehicle } from '../types';

interface VehicleContextType {
  getAllVehicles: (filters?: any) => Promise<Vehicle[]>;
  searchVehicles: (query: string) => Promise<Vehicle[]>;
  getVehicleById: (id: string) => Promise<Vehicle | null>;
  getVehiclesByOwner: () => Promise<Vehicle[]>;
  deleteVehicle: (id: string) => Promise<void>;
  registerVehicle: (data: FormData) => Promise<any>;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const ownerBaseUrl = 'http://localhost:8000/api/owner/'

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/customer/vehicle', 
    withCredentials: true,
  });

    const ownerapi = axios.create({
    baseURL: ownerBaseUrl + "vehicle",
    withCredentials: true,
  });

  const getAllVehicles = async (filters: any = {}) => {
    const res = await api.get('/', { params: filters });
    return res.data.data;
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

  const deleteVehicle = async (id: string) => {
    await ownerapi.delete(`/${id}`);
  };

  const registerVehicle = async (data: FormData) => {
    return await ownerapi.post("/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  return (
    <VehicleContext.Provider value={{ getAllVehicles, searchVehicles, getVehicleById,registerVehicle, getVehiclesByOwner, deleteVehicle  }}>
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