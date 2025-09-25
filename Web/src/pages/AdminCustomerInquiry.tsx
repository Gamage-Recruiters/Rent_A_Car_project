import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_URL = `${BASE.replace(/\/$/, '')}/superadmin`;

interface Inquiry {
  _id: string;
  subject: string;
  message: string;
  createdAt?: string;
  customer?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
}
const AdminCustomerInquiry: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Inquiry | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/customers/inquiries`, { credentials: 'include' });
      if (res.status === 401) {
       setError('Unauthenticated (please log in as superadmin)');
        setInquiries([]);
        setCount(0);
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch inquiries (${res.status})`);
      const data = await res.json();
      setInquiries(data || []);
    } catch (err: any) {
     setError(err?.message || 'Error fetching inquiries');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchCount = async () => {
    try {
     const res = await fetch(`${API_URL}/customers/inquiries/count`, { credentials: 'include' });
      if (!res.ok) return;
      const body = await res.json();
      setCount(Number(body?.total ?? 0));
    } catch (err) {
      console.error('Failed to fetch inquiries count', err);
    }
  };
  useEffect(() => {
   fetchInquiries();
    fetchCount();
  }, []);

  const viewInquiry = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/customers/inquiries/${id}`, { credentials: 'include' });
      if (!res.ok) {
        alert('Failed to fetch inquiry details');
        return;
      }
      const data = await res.json();
      setActive(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching inquiry details');
    }
  };
return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Customer Inquiries</h1>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">Total inquiries: <span className="font-semibold">{count}</span></div>
        <div>
          <button onClick={() => { fetchInquiries(); fetchCount(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
        </div>
      </div>

      {loading && <div className="text-gray-600">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {inquiries.map((inq) => (
         <div key={inq._id} className="bg-white p-4 rounded shadow">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="text-gray-500 w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                  <h3 className="font-semibold text-lg">{inq.subject}</h3>
                    <div className="text-sm text-gray-500">{inq.customer ? `${inq.customer.firstName ?? ''} ${inq.customer.lastName ?? ''}` : 'Guest'}</div>
                  </div>
                  <div className="text-sm text-gray-400">{inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ''}</div>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">{inq.message}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => viewInquiry(inq._id)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">View</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {inquiries.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500">No inquiries found</div>
        )}
      </div>
{/* Details modal */}
      {active && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-2">{active.subject}</h3>
            <div className="text-sm text-gray-600 mb-4">{active.createdAt ? new Date(active.createdAt).toLocaleString() : ''}</div>
            <div className="mb-4">
              <strong>From:</strong> {active.customer ? `${active.customer.firstName ?? ''} ${active.customer.lastName ?? ''} (${active.customer.email ?? '-'})` : 'Guest'}
            </div>
            <div className="mb-4 text-gray-800">{active.message}</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setActive(null)} className="px-3 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerInquiry;