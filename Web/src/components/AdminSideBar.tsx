import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Car, Shield, MessageSquare } from "lucide-react" // optional icons

interface MenuItem {
  label: string
  to: string
  icon: React.ReactNode
}

const AdminSidebar: React.FC = () => {
  

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
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium ${
                isActive ? 'bg-slate-700 text-white' : 'text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            
              <span className="text-slate-300">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
       </nav>
     </div>
   )
 }

export default AdminSidebar
