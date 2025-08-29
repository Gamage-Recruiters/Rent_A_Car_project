// Web/src/pages/AdminVehicleListingsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle } from '../types';
import { mockVehicles } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

type VehicleWithStatus = Vehicle & { status?: 'pending' | 'approved' | 'rejected' };

const AdminVehicleListingsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  // 1) Load requests (default to 'pending')
  useEffect(() => {
    const fetchPendingVehicles = () => {
      setTimeout(() => {
        const vehiclesWithStatus: VehicleWithStatus[] = mockVehicles.map(v => ({
          ...v,
          status: 'pending'
        }));
        setVehicles(vehiclesWithStatus);
        setLoading(false);
      }, 800);
    };
    fetchPendingVehicles();
  }, []);

  // 2) Central filtering reacts to vehicles + search + status
  useEffect(() => {
    const search = searchTerm.toLowerCase().trim();
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.name.toLowerCase().includes(search) ||
        vehicle.brand.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.ownerId.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter]);

  // 3) Counters
  const { total, approvedCount, pendingCount, rejectedCount } = useMemo(() => {
    const counts = vehicles.reduce(
      (acc, v) => {
        acc.total += 1;
        if (v.status === 'approved') acc.approvedCount += 1;
        else if (v.status === 'rejected') acc.rejectedCount += 1;
        else acc.pendingCount += 1;
        return acc;
      },
      { total: 0, approvedCount: 0, pendingCount: 0, rejectedCount: 0 }
    );
    return counts;
  }, [vehicles]);

  // Actions
  const handleApprove = (id: string) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, status: 'approved' } : v)));
    console.log(`Vehicle ${id} approved`);
  };

  const handleReject = (id: string) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, status: 'rejected' } : v)));
    console.log(`Vehicle ${id} rejected`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/vehicles/${id}`);
  };

  // Inputs
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // UI helpers
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  // Exports
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Vehicle Availability Report', 14, 18);
    doc.setFontSize(10);
    doc.text('Generated on: ' + new Date().toLocaleString(), 14, 26);

    let y = 38;
    filteredVehicles.forEach(v => {
      doc.text(
        `Name: ${v.name} | Brand/Model: ${v.brand} ${v.model} | Owner: ${v.ownerId} | Status: ${v.status}`,
        14,
        y
      );
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('vehicle_availability_report.pdf');
  };

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredVehicles.map(v => ({
        Name: v.name,
        Brand: v.brand,
        Model: v.model,
        Owner: v.ownerId,
        Status: v.status,
        PricePerDay: v.pricePerDay,
        Location: v.location
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicles');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'vehicle_availability_report.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-10 w-10 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading vehicle listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Approval</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pending requests and approvals.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-2xl font-semibold">{total}</div>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="text-2xl font-semibold text-green-600">{approvedCount}</div>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-semibold text-yellow-600">{pendingCount}</div>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-500">Rejected</div>
            <div className="text-2xl font-semibold text-red-600">{rejectedCount}</div>
          </div>
        </div>

        {/* Search / Filter / Export */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              placeholder="Search by name, brand, model, or owner ID…"
              value={searchTerm}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2"
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Generate PDF
            </button>
            <button
              onClick={generateExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Generate Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredVehicles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No vehicles found for the current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={vehicle.images?.[0]}
                              alt={vehicle.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                            <div className="text-sm text-gray-500">
                              {vehicle.brand} {vehicle.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>ID: {vehicle.ownerId}</div>
                        <div>{vehicle.contactInfo?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          ${Number(vehicle.pricePerDay).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(vehicle.status)}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(vehicle.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleApprove(vehicle.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(vehicle.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVehicleListingsPage;
