"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { User, Settings, Lock, LogOut, ChevronDown } from "lucide-react"

interface AdminProfileDropdownProps {
  adminName?: string
  adminEmail?: string
  adminAvatar?: string
  onGetProfile?: () => void
  onUpdateProfile?: () => void
  onChangePassword?: () => void
  onLogout?: () => void
}

const AdminProfileDropdown: React.FC<AdminProfileDropdownProps> = ({
  adminName = "Admin User",
  adminEmail = "admin@carrental.com",
  adminAvatar,
  onGetProfile,
  onUpdateProfile,
  onChangePassword,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMenuClick = (action?: () => void) => {
    if (action) {
      action()
    }
    setIsOpen(false)
  }

  // Generate initials from admin name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
          {adminAvatar ? (
            <img src={adminAvatar || "/placeholder.svg"} alt="Admin" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            getInitials(adminName)
          )}
        </div>

        {/* Admin Name (hidden on mobile) */}
        <span className="hidden md:block text-sm font-medium text-gray-700">{adminName}</span>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* Admin Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {adminAvatar ? (
                  <img
                    src={adminAvatar || "/placeholder.svg"}
                    alt="Admin"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  getInitials(adminName)
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">{adminEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleMenuClick(onGetProfile)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4" />
              Get Admin Profile
            </button>

            <button
              onClick={() => handleMenuClick(onUpdateProfile)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Update Profile
            </button>

            <button
              onClick={() => handleMenuClick(onChangePassword)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>

            <hr className="my-1 border-gray-100" />

            {/* <button
              onClick={() => handleMenuClick(onLogout)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button> */}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProfileDropdown
