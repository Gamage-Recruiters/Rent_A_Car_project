"use client"

import type React from "react"
import { useState } from "react"
import { Trash2, Plus, User, Mail, Phone, Calendar, Key, Eye, EyeOff } from "lucide-react"

interface Admin {
  id: number
  name: string
  email: string
  password: string
  registeredDate: string
  phone: string
}

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "abcd123",
      registeredDate: "2025-09-10",
      phone: "123-456-7890",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      password: "abcd123",
      registeredDate: "2025-09-11",
      phone: "098-765-4321",
    },
  ])

  // Modal for adding admin
  const [showModal, setShowModal] = useState(false)

  // Modal for deleting admin
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null)

  const [newAdmin, setNewAdmin] = useState<Omit<Admin, "id" | "registeredDate">>({
    name: "",
    email: "",
    password: "",
    phone: "",
  })

  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set())

  const togglePasswordVisibility = (adminId: number) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(adminId)) {
        newSet.delete(adminId)
      } else {
        newSet.add(adminId)
      }
      return newSet
    })
  }

  // Add admin modal controls
  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => {
    setShowModal(false)
    setNewAdmin({ name: "", email: "", phone: "", password: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = admins.length + 1
    const today = new Date().toISOString().split("T")[0]

    const admin: Admin = {
      id: newId,
      registeredDate: today,
      ...newAdmin,
    }

    setAdmins([...admins, admin])
    handleCloseModal()
  }

  // Handle delete modal open
  const openDeleteModal = (id: number) => {
    setSelectedAdminId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedAdminId !== null) {
      setAdmins(admins.filter((admin) => admin.id !== selectedAdminId))
    }
    setDeleteModalOpen(false)
    setSelectedAdminId(null)
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setSelectedAdminId(null)
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Management</h1>
          <p className="text-slate-600">Manage your admin users and their permissions</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus size={18} />
          Add Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <th className="py-4 px-6 text-left font-semibold">ID</th>
                <th className="py-4 px-6 text-left font-semibold">Name</th>
                <th className="py-4 px-6 text-left font-semibold">Email</th>
                <th className="py-4 px-6 text-left font-semibold">Password</th>
                <th className="py-4 px-6 text-left font-semibold">Registered Date</th>
                <th className="py-4 px-6 text-left font-semibold">Phone</th>
                <th className="py-4 px-6 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr
                  key={admin.id}
                  className={`hover:bg-slate-50 transition-colors duration-200 ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}`}
                >
                  <td className="py-4 px-6 border-b border-slate-100">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold">
                      {admin.id}
                    </span>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="font-medium text-slate-800">{admin.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} />
                      {admin.email}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                        <button
                        onClick={() => togglePasswordVisibility(admin.id)}
                        className="ml-1 p-1 hover:bg-slate-200 rounded transition-colors duration-200"
                        title={visiblePasswords.has(admin.id) ? "Hide password" : "Show password"}
                      >
                        {visiblePasswords.has(admin.id) ? (
                          <EyeOff size={14} className="text-slate-500" />
                        ) : (
                          <Eye size={14} className="text-slate-500" />
                        )}
                      </button>
                      
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">
                        {visiblePasswords.has(admin.id) ? admin.password : "••••••••"}
                      </span>
                      
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} />
                      {admin.registeredDate}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} />
                      {admin.phone}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100 text-center">
                    <button
                      onClick={() => openDeleteModal(admin.id)}
                      className="inline-flex items-center justify-center w-10 h-10 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200 hover:scale-110"
                      title="Delete Admin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Plus size={20} className="text-white" />
                </div>
                Add New Admin
              </h2>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Key size={16} />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newAdmin.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Confirm Deletion</h2>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this admin? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminList
