import React, { useState } from "react";
import { Trash2 } from "lucide-react";

interface Admin {
  id: number;
  name: string;
  email: string;
  password:string
  registeredDate: string;
  phone: string;
}

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password:"abcd123",
      registeredDate: "2025-09-10",
      phone: "123-456-7890",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      password:"abcd123",
      registeredDate: "2025-09-11",
      phone: "098-765-4321",
    },
  ]);

  // Modal for adding admin
  const [showModal, setShowModal] = useState(false);

  // Modal for deleting admin
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);

  const [newAdmin, setNewAdmin] = useState<Omit<Admin, "id" | "registeredDate">>(
    {
      name: "",
      email: "",
      password:"",
      phone: "",
    }
  );

  // Add admin modal controls
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewAdmin({ name: "", email: "", phone: "" ,password:"",});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = admins.length + 1;
    const today = new Date().toISOString().split("T")[0];

    const admin: Admin = {
      id: newId,
      registeredDate: today,
      ...newAdmin,
    };

    setAdmins([...admins, admin]);
    handleCloseModal();
  };

  // Handle delete modal open
  const openDeleteModal = (id: number) => {
    setSelectedAdminId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAdminId !== null) {
      setAdmins(admins.filter((admin) => admin.id !== selectedAdminId));
    }
    setDeleteModalOpen(false);
    setSelectedAdminId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedAdminId(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admins</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Admin
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border-b">ID</th>
              <th className="py-3 px-4 border-b">Name</th>
              <th className="py-3 px-4 border-b">Email</th>
              <th className="py-3 px-4 border-b">Password</th>
              <th className="py-3 px-4 border-b">Registered Date</th>
              <th className="py-3 px-4 border-b">Phone</th>
              <th className="py-3 px-4 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{admin.id}</td>
                <td className="py-2 px-4 border-b">{admin.name}</td>
                <td className="py-2 px-4 border-b">{admin.email}</td>
                <td className="py-2 px-4 border-b">{admin.password}</td>
                <td className="py-2 px-4 border-b">{admin.registeredDate}</td>
                <td className="py-2 px-4 border-b">{admin.phone}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => openDeleteModal(admin.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Admin</h2>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newAdmin.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this admin?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;
