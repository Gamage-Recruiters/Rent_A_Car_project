import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Car, Shield, MessageSquare } from "lucide-react" // optional icons

interface MenuItem {
  label: string
  to: string
  icon: React.ReactNode
}

const AdminSidebar: React.FC = () => {
  const location = useLocation()

  const menuItems: MenuItem[] = [
    { label: "Dashboard", to: "/admin-dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Account management", to: "/manage-accounts", icon: <Users size={18} /> },

    { label: "Vehicles", to: "/admin-vehicle-listings", icon: <Car size={18} /> },
    { label: "Admins", to: "/adminlist", icon: <Shield size={18} /> },

    { label: "Customer Inquiries", to: "/admininquiries", icon: <MessageSquare size={18} /> },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 shadow-2xl min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white tracking-wide">Admin Panel</h2>
        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
      </div>
      <nav className="space-y-2 px-3 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              location.pathname === item.to
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:transform hover:scale-105"
            }`}
          >
            <div
              className={`transition-transform duration-200 ${location.pathname === item.to ? "scale-110" : "group-hover:scale-110"}`}
            >
              {item.icon}
            </div>
            <span className="font-medium">{item.label}</span>
            {location.pathname === item.to && (
              <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default AdminSidebar
