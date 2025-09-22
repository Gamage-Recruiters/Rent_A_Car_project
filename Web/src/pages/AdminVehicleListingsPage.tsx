// Web/src/pages/AdminVehicleListingsPage.tsx
import React, { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { mockVehicles } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const AdminVehicleListingsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingVehicles = () => {
      setTimeout(() => {
        const vehiclesWithStatus = mockVehicles.map(v => ({
          ...v,
          status: 'pending' as 'pending'
        }));
        setVehicles(vehiclesWithStatus);
        setFilteredVehicles(vehiclesWithStatus);
        setLoading(false);
      }, 800);
    };
    
    fetchPendingVehicles();
  }, []);

  const handleApprove = (id: string) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { ...v, status: 'approved' } : v
    ));
    console.log(`Vehicle ${id} approved`);
  };

  const handleReject = (id: string) => {
    setVehicles(vehicles.map(v => 
      v.id === id ? { ...v, status: 'rejected' } : v
    ));
    console.log(`Vehicle ${id} rejected`);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/vehicles/${id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterVehicles(value, statusFilter);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
    filterVehicles(searchTerm, value);
  };

  const filterVehicles = (search: string, status: string) => {
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || vehicle.status === status;
      return matchesSearch && matchesStatus;
    });
    setFilteredVehicles(filtered);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Vehicle Availability Report", 14, 20);
    doc.text("Generated on: " + new Date().toLocaleString(), 14, 30);
    
    let y = 40;
    filteredVehicles.forEach(vehicle => {
      doc.text(`Name: ${vehicle.name}, Status: ${vehicle.status}`, 14, y);
      y += 10;
    });

    doc.save("vehicle_availability_report.pdf");
  };

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredVehicles.map(vehicle => ({
      Name: vehicle.name,
      Owner: vehicle.ownerId,
      Status: vehicle.status,
      PricePerDay: vehicle.pricePerDay,
      Location: vehicle.location,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicles");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "vehicle_availability_report.xlsx");
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Approval</h1>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by vehicle name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded-lg px-4 py-2 w-1/3"
          />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 ml-4"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="ml-4">
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Generate PDF
            </button>
            <button
              onClick={generateExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 ml-2"
            >
              Generate Excel
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
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
                          <img className="h-10 w-10 rounded-md object-cover" 
                               src={vehicle.images[0]} 
                               alt={vehicle.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                          <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>ID: {vehicle.ownerId}</div>
                      <div>{vehicle.contactInfo.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">${vehicle.pricePerDay}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
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
        </div>
      </div>
    </div>
  );
};

export default AdminVehicleListingsPage;
