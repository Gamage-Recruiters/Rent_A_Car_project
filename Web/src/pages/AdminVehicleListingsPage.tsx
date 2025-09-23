// Web/src/pages/AdminVehicleListingsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle } from '../types';
//import { mockVehicles } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

type VehicleWithStatus = Vehicle & { status?: 'pending' | 'approved' | 'rejected'; _id?: string };

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_URL = `${BASE.replace(/\/$/, '')}/superadmin`;

const AdminVehicleListingsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [approvedTotal, setApprovedTotal] = useState<number>(0);
  const [pendingTotal, setPendingTotal] = useState<number>(0);
  const [rejectedTotal, setRejectedTotal] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  
  
  // navigate to vehicle details
  const handleViewDetails = (id: string) => {
    if (!id) return;
    navigate(`/admin/vehicles/${id}`);
  };

  // Fetch approved count from backend
 const fetchApprovedTotal = async () => {
   try {
     const res = await fetch(`${API_URL}/vehicles/count/approved`, { credentials: 'include' });
     if (!res.ok) {
       console.warn('Failed to fetch approved total', res.status);
       return;
     }
     const data = await res.json();
     setApprovedTotal(Number(data?.total ?? 0));
   } catch (err) {
     console.error('Error fetching approved total', err);
   }
 };

 const fetchPendingTotal = async () => {
    try {
      const res = await fetch(`${API_URL}/vehicles/count/pending`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setPendingTotal(Number(data?.total ?? 0));
    } catch (err) {
      console.error('Error fetching pending total', err);
    }
  };

  const fetchRejectedTotal = async () => {
    try {
      const res = await fetch(`${API_URL}/vehicles/count/rejected`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setRejectedTotal(Number(data?.total ?? 0));
    } catch (err) {
      console.error('Error fetching rejected total', err);
    }
  };


 // Fetch approved vehicles (show details only, no approve/reject actions)
 const fetchApprovedVehicles = async () => {
   setLoading(true);
   try {
    const res = await fetch(`${API_URL}/vehicles/approved`, { credentials: 'include' });
     console.log('[Vehicles] fetch approved url:', `${API_URL}/vehicles/approved`, 'status:', res.status);
     if (!res.ok) {
       const bodyText = await res.text().catch(() => '<no body>');
       console.error('[Vehicles] fetch approved failed body:', bodyText);
       setVehicles([]);
       return;
     }
     const data = await res.json();
     console.log('[Vehicles] approved raw data:', data);
     const mapped: VehicleWithStatus[] = (data || []).map((v: any) => ({
       _id: v._id ?? v.id,
       id: v._id ?? v.id,
       name: v.name ?? v.vehicleName ?? 'Unnamed',
       brand: v.brand ?? '',
       model: v.model ?? '',
       ownerId: v.owner ?? v.ownerId ?? '',
       contactInfo: v.contactInfo ?? { email: v.email ?? '', phone: v.phone ?? '', address: v.address ?? '' },
       images: v.images ?? [],
       pricePerDay: v.pricePerDay ?? v.dailyPrice ?? 0,
       pricePerKm: v.pricePerKm ?? undefined,
       type: v.type ?? '',
       seats: v.seats ?? 0,
       fuelType: v.fuelType ?? '',
       transmission: v.transmission ?? '',
year: v.year ?? '',
       mileage: v.mileage ?? undefined,
       description: v.description ?? '',
       rating: v.rating ?? 0,
       reviewCount: v.reviewCount ?? 0,
       location: v.location ?? '',
       status: 'approved',
     }));
     setVehicles(mapped);
     fetchApprovedTotal();
   } catch (err) {
     console.error('Error fetching approved vehicles', err);
     setVehicles([]);
   } finally {
     setLoading(false);
   }
 };


  // Load requests (default to 'pending')
  useEffect(() => {
    
    const fetchPendingVehicles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/vehicles/pending`, { credentials: 'include' });
        console.log('[Vehicles] fetch url:', `${API_URL}/vehicles/pending`, 'status:', res.status);
        if (!res.ok) {
          const bodyText = await res.text().catch(()=>'<no body>');
         console.error('[Vehicles] fetch failed body:', bodyText);
          console.error('Failed to fetch pending vehicles', res.status);
          setVehicles([]);
          return;
       }
        const data = await res.json();
        console.log('[Vehicles] raw data:', data);
        // map backend docs to VehicleWithStatus
        const mapped: VehicleWithStatus[] = (data || []).map((v: any) => ({
          // keep _id but provide id for UI where needed
          _id: v._id ?? v.id,
          id: v._id ?? v.id,
          name: v.name ?? v.vehicleName ?? 'Unnamed',
          brand: v.brand ?? '',
          model: v.model ?? '',
          ownerId: v.owner ?? v.ownerId ?? '',
          contactInfo: v.contactInfo ?? { email: v.email ?? '', phone: v.phone ?? '', address: v.address ?? '' },
          images: v.images ?? [],
          pricePerDay: v.pricePerDay ?? v.dailyPrice ?? 0,
          pricePerKm: v.pricePerKm ?? undefined,
          type: v.type ?? '',
          seats: v.seats ?? 0,
          fuelType: v.fuelType ?? '',
          transmission: v.transmission ?? '',
          year: v.year ?? '',
          mileage: v.mileage ?? undefined,
          description: v.description ?? '',
          rating: v.rating ?? 0,
          reviewCount: v.reviewCount ?? 0,
          location: v.location ?? '',
         status: v.isApproved ? 'approved' : 'pending',
        }));
        
        setVehicles(mapped);
        
      } catch (err) {
        console.error('Error fetching pending vehicles', err);
        setVehicles([]);
        // refresh counts
        fetchApprovedTotal();
        fetchPendingTotal();
        fetchRejectedTotal();
      } finally {
        setLoading(false);
      }
    };
    fetchPendingVehicles();
    fetchApprovedTotal();
    fetchPendingTotal();
   fetchRejectedTotal();
   }, []);
  // Filtering logic unchanged
  useEffect(() => {
    const search = searchTerm.toLowerCase().trim();
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch =
        (vehicle.name ?? '').toLowerCase().includes(search) ||
        (vehicle.brand ?? '').toLowerCase().includes(search) ||
        (vehicle.model ?? '').toLowerCase().includes(search) ||
        (vehicle.ownerId ?? '').toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter]);

  // Counters
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
  // show global total from server-side counts (keeps card accurate)
  const totalCount = approvedTotal + pendingTotal + rejectedTotal;

    // debug: log counts when they change
  useEffect(() => {
    console.log('Vehicle counts -> approved:', approvedTotal, 'pending:', pendingTotal, 'rejected(deleted):', rejectedTotal, 'totalCount:', totalCount);
  }, [approvedTotal, pendingTotal, rejectedTotal, totalCount]);

  // Approve via API -> update local state to approved
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/vehicles/approve/${id}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('Approve failed', body);
        return;
      }
      // update state
      setVehicles(prev => prev.map(v => (v._id === id || v.id === id ? { ...v, status: 'approved' } : v)));
      fetchApprovedTotal();
      fetchPendingTotal();
      fetchRejectedTotal();
    } catch (err) {
      console.error('Error approving vehicle', err);
    }
  };

  // Reject via API -> remove from local state
  const handleReject = async (id: string) => {
    if (!confirm('Reject and delete this vehicle?')) return;
    try {
      const res = await fetch(`${API_URL}/vehicles/reject/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('Reject failed', body);
        return;
      }
      setVehicles(prev => prev.filter(v => !(v._id === id || v.id === id)));
      fetchApprovedTotal();
      fetchPendingTotal();
      fetchRejectedTotal();
    } catch (err) {
      console.error('Error rejecting vehicle', err);
    }
  };

  // helper: fetch all vehicles for export (uses backend search/all endpoint)
const fetchAllVehiclesForExport = async (): Promise<VehicleWithStatus[]> => {
  try {
    const res = await fetch(`${API_URL}/vehicles/search`, { credentials: 'include' }); // adjust endpoint if different
    if (!res.ok) {
      console.error('Failed to fetch all vehicles for export', res.status);
      return [];
    }
    const data = await res.json();
    return (data || []).map((v: any) => ({
      _id: v._id ?? v.id,
      id: v._id ?? v.id,
      name: v.name ?? v.vehicleName ?? 'Unnamed',
      brand: v.brand ?? '',
      model: v.model ?? '',
      ownerId: v.owner ?? v.ownerId ?? '',
      pricePerDay: v.pricePerDay ?? v.dailyPrice ?? 0,
      location: v.location ?? '',
      year: v.year ?? '',
      transmission: v.transmission ?? '',
      status: v.isApproved ? 'approved' : 'pending'
    }));
  } catch (err) {
    console.error('Error fetching vehicles for export', err);
    return [];
  }
};

  

  const generatePDF = async () => {
  const all = await fetchAllVehiclesForExport();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  doc.text('Vehicle Report', 40, 40);
  doc.setFontSize(10);
  doc.text('Generated on: ' + new Date().toLocaleString(), 40, 56);

  const headers = ['Name', 'Brand', 'Model', 'Owner', 'Status', 'Price/Day', 'Location', 'Year', 'Transmission'];
  let y = 80;
  doc.setFontSize(9);
  headers.forEach((h, i) => doc.text(h, 40 + i * 70, y));
  y += 18;

  all.forEach(v => {
    if (y > 760) { doc.addPage(); y = 40; }
    const cells = [
      v.name, v.brand, v.model, v.ownerId, v.status,
      `$${Number(v.pricePerDay).toFixed(2)}`, v.location, v.year ?? '', v.transmission
    ];
    cells.forEach((c, i) => doc.text(String(c ?? ''), 40 + i * 70, y));
    y += 16;
  });

  doc.save('vehicles_report.pdf');
};

const generateExcel = async () => {
  const all = await fetchAllVehiclesForExport();
  const rows = all.map(v => ({
    Name: v.name,
    Brand: v.brand,
    Model: v.model,
    Owner: v.ownerId,
    Status: v.status,
    PricePerDay: v.pricePerDay,
    Location: v.location,
    Year: v.year,
    Transmission: v.transmission
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicles');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'vehicles_report.xlsx');
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
            <div className="text-2xl font-semibold">{totalCount}</div>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="text-2xl font-semibold text-green-600">{approvedTotal}</div>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-semibold text-yellow-600">{pendingTotal}</div>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-500">Rejected</div>
            <div className="text-2xl font-semibold text-red-600">{rejectedTotal}</div>
          </div>
        </div>
         {/* Search / Filter / Export */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 flex gap-3">
            <input
              type="text"
              placeholder="Search by name, brand, model, or owner ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex gap-2">
             {/* Corner button: load approved vehicles (details only) */}
            <button
              onClick={fetchApprovedVehicles}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
              title="Show approved vehicles"
            >
              Approved Vehicles
            </button>
            <button onClick={generatePDF} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Generate PDF</button>
            <button onClick={generateExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Generate Excel</button>
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
                    <tr key={vehicle._id ?? vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md object-cover" src={vehicle.images?.[0]} alt={vehicle.name} />
                          </div>
                     <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                            <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>ID: {vehicle.ownerId}</div>
                        <div>{vehicle.contactInfo?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">${Number(vehicle.pricePerDay).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {vehicle.status === 'approved' ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
                        ) : vehicle.status === 'rejected' ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                        )}
                      </td>   

                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleViewDetails(vehicle._id ?? vehicle.id)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded" title="View details">
                            <Eye className="w-5 h-5" />
                          </button>
                          {/* show approve/reject only for non-approved vehicles */}
                          {vehicle.status !== 'approved' && (
                            <>
                              <button onClick={() => handleApprove(vehicle._id ?? vehicle.id)} className="text-green-600 hover:text-green-900 p-1 rounded" title="Approve">
                                <Check className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleReject(vehicle._id ?? vehicle.id)} className="text-red-600 hover:text-red-900 p-1 rounded" title="Reject">
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
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
