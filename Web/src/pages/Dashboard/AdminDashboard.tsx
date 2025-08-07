"use client"

import type React from "react"
import { Users, Calendar, DollarSign, Clock, TrendingUp, TrendingDown, FileText, FileSpreadsheet } from "lucide-react"

const AdminDashboard: React.FC = () => {
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

  const recentActivities = [
    { action: "New user registration", user: "john.doe@email.com", time: "2 minutes ago", type: "user" },
    { action: "Booking confirmed", user: "sarah.smith@email.com", time: "5 minutes ago", type: "booking" },
    { action: "Payment received", user: "$1,250.00", time: "12 minutes ago", type: "payment" },
    { action: "Verification pending", user: "mike.wilson@email.com", time: "18 minutes ago", type: "verification" },
  ]

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
            {/* Report Generation Buttons */}
            <div className="flex space-x-3">
              <button className="flex items-center gap-2 bg-transparent border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <FileText className="h-4 w-4" />
                <span>Generate PDF</span>
              </button>
              <button className="flex items-center gap-2 bg-transparent border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Generate Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
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
    </div>
  )
}

export default AdminDashboard
