import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Car,
  Shield,
  User,
  MessageSquare,
  Settings
} from "lucide-react"; // optional icons

interface MenuItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { label: "Dashboard", to: "/admin-dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Account management", to: "/manage-accounts", icon: <Users size={18} /> },
    
    { label: "Vehicles", to: "/admin-vehicle-listings", icon: <Car size={18} /> },
    { label: "Admins", to: "/adminlist", icon: <Shield size={18} /> },
    
    { label: "Customer Inquiries", to: "/admininquiries", icon: <MessageSquare size={18} /> },
    
  ];

  return (
    <div className="w-64 bg-white border-r shadow-md min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="space-y-1 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors ${
              location.pathname === item.to ? "bg-gray-300 font-medium" : ""
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;