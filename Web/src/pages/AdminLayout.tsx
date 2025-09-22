import React, { ReactNode } from "react";
import AdminSidebar from "../components/AdminSideBar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default AdminLayout;
