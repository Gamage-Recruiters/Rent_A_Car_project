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
const API_URL = "http://localhost:8000/api/superAdmin"

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch admin data from backend
  const fetchAdmin = async () => {
    try {
      setLoading(true)
      // Check if we have admin data in localStorage before making request
      const storedAdmin = localStorage.getItem('admin');
      if (!storedAdmin) {
        // No stored admin, no need to fetch
        return null;
      }
      const res = await fetch(`${API_URL}/profile`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch admin data")
      const data = await res.json()
      setAdmin(data)
    } catch (error) {
      console.error("Error fetching admin:", error)
    } finally {
      setLoading(false)
    }
  }

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
