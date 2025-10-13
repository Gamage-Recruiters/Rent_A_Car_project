"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

// ✅ Define Admin type
interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  joinDate: string
  role: string
  avatar?: string
}

// ✅ Context type
interface AdminContextType {
  admin: Admin | null
  loading: boolean
  fetchAdmin: () => Promise<void>
  updateAdmin: (data: Partial<Admin>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

// ✅ Create Context
const AdminContext = createContext<AdminContextType | undefined>(undefined)

// ✅ API Base URL (change according to your backend)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_URL = `${BASE.replace(/\/$/, "")}/superadmin`;

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch admin data from backend
  const fetchAdmin = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/profile`, { credentials: 'include' });
      if (res.status === 401) {
        console.warn('fetchAdmin: unauthenticated (401)');
        setAdmin(null);
        return;
      }
      if (!res.ok) {
        console.error('fetchAdmin failed:', res.status, res.statusText);
        setAdmin(null);
        return;
      }
      const data = await res.json();
      setAdmin({
        id: data._id ?? '',
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        joinDate: data.createdAt ?? '',
        role: data.role ?? 'admin',
        avatar: data.avatar ?? undefined,
      });
    } catch (err) {
      console.error('Error fetching admin:', err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateAdmin = async (data: Partial<Admin>) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to update admin")
      const updated = await res.json()
      setAdmin(updated)
    } catch (error) {
      console.error("Error updating admin:", error)
    }
  }

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch(`${API_URL}/profile/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to change password")
      }

      const data = await res.json()
      console.log(data.message || "Password updated successfully")
      return data
    } catch (error: any) {
      console.error("Error changing password:", error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchAdmin()
  }, [])

  return (
    <AdminContext.Provider value={{ admin, loading, fetchAdmin, updateAdmin, changePassword }}>
      {children}
    </AdminContext.Provider>
  )
}

// ✅ Hook to use AdminContext
export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) throw new Error("useAdmin must be used within AdminProvider")
  return context
}