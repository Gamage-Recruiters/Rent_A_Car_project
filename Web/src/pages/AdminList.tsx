"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Trash2, Plus, User, Mail, Phone, Calendar, Key, Eye } from "lucide-react"

interface Admin {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  status?: string
  createdAt?: string
}

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_URL = `${BASE.replace(/\/$/, "")}/auth/superadmin`;

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [activeAdmin, setActiveAdmin] = useState<Admin | null>(null)
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [newAdmin, setNewAdmin] = useState<{ name: string; email: string; password: string; phone: string }>({
    name: "",
    email: "",
    password: "",
    phone: "",
  })

  const fetchAdmins = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(`${API_URL}/admins`, { credentials: "include" })
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(txt || `Failed to load admins (${res.status})`)
      }
      const data = await res.json()
      setAdmins(data || [])
    } catch (e: any) {
      setErr(e?.message || "Failed to load admins")
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAdmin((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/admins`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdmin.email,
          password: newAdmin.password,
          firstName: newAdmin.name.split(" ")[0] ?? "",
          lastName: newAdmin.name.split(" ").slice(1).join(" ") ?? ""
        })
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || `Create failed (${res.status})`)
      await fetchAdmins()
      setShowModal(false)
      setNewAdmin({ name: "", email: "", password: "", phone: "" })
    } catch (err: any) {
      alert(err?.message || "Failed to create admin")
    }
  }

  const handleView = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admins/${id}`, { credentials: "include" })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      const data = await res.json()
      setActiveAdmin(data)
    } catch (e: any) {
      alert(e?.message || "Failed to fetch admin details")
    }
  }

  const openDeleteModal = (id: string) => {
    setSelectedAdminId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setSelectedAdminId(null)
  }

  const handleDeleteConfirm = async () => {
    if (selectedAdminId === null) return
    try {
      const res = await fetch(`${API_URL}/admins/${selectedAdminId}`, {
        method: "DELETE",
        credentials: "include"
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.message || `Delete failed (${res.status})`)
      await fetchAdmins()
    } catch (err: any) {
      alert(err?.message || "Failed to delete admin")
    } finally {
      setDeleteModalOpen(false)
      setSelectedAdminId(null)
    }
  }

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => {
    setShowModal(false)
    setNewAdmin({ name: "", email: "", phone: "", password: "" })
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
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-left font-semibold">Created</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr key={admin._id} className={`hover:bg-slate-50 transition-colors duration-200 ${index % 2 === 0 ? "bg-white" : "bg-slate-25"}`}>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold">
                      {admin._id.slice(-6)}
                    </span>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                      <span className="font-medium text-slate-800">{(admin.firstName || "") + " " + (admin.lastName || "")}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} />
                      {admin.email}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-slate-100">{admin.status ?? "approved"}</td>
                  <td className="py-4 px-6 border-b border-slate-100">{admin.createdAt ? new Date(admin.createdAt).toLocaleString() : "-"}</td>
                  <td className="py-4 px-6 border-b border-slate-100 text-center">
                    <div className="inline-flex gap-2 justify-center">
                      <button onClick={() => handleView(admin._id)} className="px-2 py-1 bg-indigo-600 text-white rounded text-sm" title="View">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openDeleteModal(admin._id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-gray-500">No admins found</td></tr>
              )}
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
      {/* View modal */}
      {activeAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Admin details</h3>
            <div className="space-y-2">
              <div><strong>Name:</strong> {(activeAdmin.firstName || "") + " " + (activeAdmin.lastName || "")}</div>
              <div><strong>Email:</strong> {activeAdmin.email}</div>
              <div><strong>Status:</strong> {activeAdmin.status}</div>
              <div><strong>Created:</strong> {activeAdmin.createdAt ? new Date(activeAdmin.createdAt).toLocaleString() : "-"}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setActiveAdmin(null)} className="px-3 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminList