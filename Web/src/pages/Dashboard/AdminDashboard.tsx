"use client"

import React, { useEffect, useState } from "react"
import { Users, Calendar, DollarSign, Clock, TrendingUp, TrendingDown, FileText, FileSpreadsheet } from "lucide-react"
import AdminProfileDropdown from "../../components/AdminProfileDropdown"
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const ADMIN_API = `${BASE.replace(/\/$/, "")}/auth/superadmin`;


const AdminDashboard: React.FC = () => {

  const generatePDF = () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const title = "Admin Dashboard Report";
      doc.setFontSize(18);
      doc.text(title, 40, 50);

      // Metrics table
      const metricsHead = [["Metric", "Value", "Change", "Description"]];
      const metricsBody = metrics.map(m => [m.title, m.value, m.change, m.description]);
      autoTable(doc, {
        startY: 80,
        head: metricsHead,
        body: metricsBody,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 98, 255] }
      });

const afterY = (doc as any).lastAutoTable?.finalY || 80 + 30 + metricsBody.length * 20;
      const actHead = [["Action", "User/Detail", "Time"]];
      const actBody = recentActivities.map(a => [a.action, a.user, a.time]);
      autoTable(doc, {
        startY: afterY + 20,
        head: actHead,
        body: actBody,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [88, 101, 242] }
      });

      const name = `admin_dashboard_report_${Date.now()}.pdf`;
      doc.save(name);
    } catch (err) {
      console.error("generatePDF error", err);
      alert("Failed to generate PDF. Check console.");
    }
  };

const arrayToCsv = (rows: string[][]) => {
    return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  };

  const generateExcel = () => {
    try {
      // Build CSV content with two sections
      const metricsHeader = ["Metric", "Value", "Change", "Description"];
      const metricsRows = metrics.map(m => [m.title, m.value, m.change, m.description]);
      const actsHeader = ["Action", "User/Detail", "Time"];
      const actsRows = recentActivities.map(a => [a.action, a.user, a.time]);

      const parts: string[][] = [];
      parts.push(["Admin Dashboard Report"]);
      parts.push([]);
      parts.push(metricsHeader);
      parts.push(...metricsRows);
      parts.push([]);
      parts.push(["Recent Activity"]);
      parts.push(actsHeader);
      parts.push(...actsRows);

      const csv = arrayToCsv(parts);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin_dashboard_report_${Date.now()}.csv`;
      document.body.appendChild(a);
a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("generateExcel error", err);
      alert("Failed to generate CSV. Check console.");
    }
  };

  const [recentActivities, setRecentActivities] = useState<{ action: string; user: string; time: string; type?: string }[]>([]);
const [allActivities, setAllActivities] = useState<{ action: string; user: string; time: string; type?: string }[] | null>(null);
 const [showAllModal, setShowAllModal] = useState(false);
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const url = `${ADMIN_API}/activities/recent?limit=10`;
        console.debug('[activities] fetch ->', url);
        const res = await fetch(url, { credentials: 'include' });
        console.debug('[activities] status ->', res.status);
        if (res.status === 401) {
          console.warn('activities fetch: unauthenticated (401)');
          return;
        }
        if (!res.ok) {
          console.error('Failed to load activities', res.status);
          return;
        }
        const data = await res.json();
        console.debug('[activities] raw ->', data);
        // backend returns createdAt; map safely with fallback
        const mapped = (data || []).map((a: any) => ({
          action: a.action ?? a.message ?? 'Activity',
          user: a.user ?? (a.meta && a.meta.user) ?? 'system',
          time: new Date(a.createdAt ?? a.time ?? Date.now()).toLocaleString(),
          type: a.type ?? 'general'
        }));
        setRecentActivities(mapped);
        
      } catch (err) {
        console.error('fetchActivities error', err);
      }
    };
    fetchActivities();
  }, []);

  const handleViewAll = async () => {
    try {
      const url = `${ADMIN_API}/activities/recent?limit=100`;
      console.debug('[activities] view all fetch ->', url);
      const res = await fetch(url, { credentials: 'include' });
      if (res.status === 401) {
        console.warn('activities fetch: unauthenticated (401)');
        return;
      }
      if (!res.ok) {
        console.error('Failed to load activities', res.status);
        return;
      }
      const data = await res.json();
      const mapped = (data || []).map((a: any) => ({
        action: a.action ?? a.message ?? 'Activity',
        user: a.user ?? (a.meta && a.meta.user) ?? 'system',
        time: new Date(a.createdAt ?? a.time ?? Date.now()).toLocaleString(),
        type: a.type ?? 'general'
      }));
      setAllActivities(mapped);
      setShowAllModal(true);
    } catch (err) {
      console.error('viewAll fetchActivities error', err);
    }
  };

  const [adminProfile, setAdminProfile] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${ADMIN_API}/profile`, { credentials: "include" });
        if (!mounted) return;
        if (res.status === 401) {
          setAdminProfile(null);
          return;
        }
        if (!res.ok) {
          console.error("Failed to fetch admin profile", res.status);
          return;
        }
        const data = await res.json();
        setAdminProfile(data || null);
      } catch (err) {
        console.error("Error fetching admin profile", err);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  const displayName = adminProfile ? `${adminProfile.firstName ?? ""}${adminProfile.lastName ? " " + adminProfile.lastName : ""}`.trim() || "Admin" : "Admin";
  const initials = (() => {
    if (!adminProfile) return "AD";
    const fn = adminProfile.firstName ?? "";
    const ln = adminProfile.lastName ?? "";
    if (fn || ln) return ((fn[0] ?? "") + (ln[0] ?? "")).toUpperCase().padEnd(2, (fn[1] ?? "A").toUpperCase()).slice(0,2);
    const emailPart = (adminProfile.email ?? "").split("@")[0] || "ad";
    return emailPart.slice(0,2).toUpperCase();
  })();

  const metrics = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+12.5%",
      changeType: "increase",
      icon: Users,
      description: "Active users this month",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-l-blue-500",
    },
    {
      title: "Total Bookings",
      value: "3,429",
      change: "+8.2%",
      changeType: "increase",
      icon: Calendar,
      description: "Bookings this month",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-l-green-500",
    },
    {
      title: "Revenue",
      value: "$89,432",
      change: "+15.3%",
      changeType: "increase",
      icon: DollarSign,
      description: "Total revenue this month",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-l-purple-500",
    },
    {
      title: "Pending Verifications",
      value: "47",
      change: "-5.1%",
      changeType: "decrease",
      icon: Clock,
      description: "Awaiting verification",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-l-orange-500",
    },
  ]

 

  // Profile dropdown handlers
  
   const handleGetProfile = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/profile`, { credentials: "include" });
      if (res.status === 401) {
        alert("Not authenticated. Please login as admin.");
        window.location.href = "/admin/login";
        return;
      }
      if (res.status === 404) {
        alert("No admin profile found.");
        return;
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("Failed to fetch profile:", res.status, txt);
        alert("Failed to load profile.");
        return;
      }
      // success -> navigate to profile page
      window.location.href = "/admin/profile";
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("Error fetching profile. Check console for details.");
    }
  }

  const handleUpdateProfile = () => {
    // Navigate directly to profile page in edit mode
    window.location.href = "/admin/profile?edit=true"
    // Or if using React Router: navigate('/admin/profile', { state: { edit: true } })
  }

  const handleChangePassword = () => {
    // Navigate to profile page with password change mode
    window.location.href = "/admin/profile?changePassword=true"
    // Or if using React Router: navigate('/admin/profile', { state: { changePassword: true } })
  }

  const handleLogout = () => {
    // Handle logout logic
    if (confirm("Are you sure you want to logout?")) {
      // Clear auth tokens, redirect to login, etc.
      console.log("Logging out...")
      window.location.href = "/admin/login"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
     {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
       <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
            </div>

            {/* Report Generation Buttons + Profile Dropdown */}
            <div className="flex items-center space-x-3">
              <button onClick={generatePDF} className="flex items-center gap-2 bg-transparent border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <FileText className="h-4 w-4" />
                <span>Generate PDF</span>
              </button>
              <button onClick={generateExcel} className="flex items-center gap-2 bg-transparent border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Generate Excel</span>
              </button>
              <AdminProfileDropdown
                adminName={displayName}
                adminEmail={adminProfile?.email ?? ""}
                adminInitials={initials}
               onGetProfile={handleGetProfile}
              onUpdateProfile={handleUpdateProfile}
                onChangePassword={handleChangePassword}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </div>
     
      <div className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 ${metric.borderColor} border-l-4 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{metric.title}</h3>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <p className="text-sm text-gray-500">{metric.description}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        metric.changeType === "increase" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {metric.changeType === "increase" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button onClick={handleViewAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
            </div>
          <div className="space-y-4">
           {recentActivities.slice(0, 3).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activity.type === "user"
                        ? "bg-blue-500"
                        : activity.type === "booking"
                          ? "bg-green-500"
                          : activity.type === "payment"
                            ? "bg-purple-500"
                            : "bg-orange-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
          
        </div>
      </div>

      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-auto max-h-[80vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">All Recent Activities</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowAllModal(false); setAllActivities(null); }} className="px-3 py-1 bg-gray-200 rounded">Close</button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {(allActivities && allActivities.length > 0) ? (
                allActivities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{a.action}</div>
                      <div className="text-xs text-gray-500">{a.user}</div>
                    </div>
                    <div className="text-xs text-gray-400">{a.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">No activities found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
