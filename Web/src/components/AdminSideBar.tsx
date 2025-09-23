import { useState } from "react";


import {
  LayoutDashboard,
  Users,
  Car,
  AlertTriangle,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  BarChart3,
  MessageSquare,
  Bell,
  LogOut,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface AdminSidebarProps {
  currentRoute?: string;
  onNavigate?: (path: string) => void;
}

const AdminSidebar = ({
  currentRoute = "/admin/dashboard",
  onNavigate,
}: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarSections: SidebarSection[] = [
    {
      title: "Overview",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin/dashboard",
        },
      ],
    },
    {
      title: "",
      items: [
        {
          id: "account-management",
          label: "Account Management",
          icon: Users,
          path: "/admin/account-management",
        },
      ],
    },
    {
      title: "",
      items: [
        {
          id: "vehicle-listings",
          label: "Vehicle Listings",
          icon: Car,
          path: "/admin/vehicle-listings",
        },
      ],
    },
    {
      title: "Support & Monitoring",
      items: [
        {
          id: "disputes",
          label: "Disputes",
          icon: MessageSquare,
          path: "/admin-disputes",
          // badge: 0
        },
        {
          id: "complaints",
          label: "Complaints",
          icon: Bell,
          path: "/admin-complaints",
          // badge: ''
        },
      ],
    },
    {
      title: "",
      items: [
        // {
        //   id: 'reports',
        //   label: 'Reports',
        //   icon: FileText,
        //   path: '/admin/reports'
        // },
        {
          id: "settings",
          label: "Platform Settings",
          icon: Settings,
          path: "/admin/settings",
        },
      ],
    },
  ];

  const isActiveRoute = (path: string) => {
    return currentRoute === path;
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
       <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-blue-400">RentACar</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
     
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}

            <nav className="space-y-1 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon
                      className={`flex-shrink-0 w-5 h-5 ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />

                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {isCollapsed && item.badge && (
                      <span className="absolute left-8 top-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        <button
          className={`group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-white" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
