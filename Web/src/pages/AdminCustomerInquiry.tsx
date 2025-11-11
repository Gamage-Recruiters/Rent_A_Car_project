import React, { useEffect, useState } from "react";
import { User, Trash2 } from "lucide-react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_URL = `${BASE.replace(/\/$/, "")}/superadmin`;

interface Reply {
  message: string;
  admin: { _id?: string; name?: string; email?: string };
  createdAt: string;
}

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
  replies?: Reply[];
}

const AdminCustomerInquiry: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id?: string }>({ show: false });

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/customers/inquiries`, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json();
      setInquiries(data || []);
    } catch (err: any) {
      setError(err?.message || "Error fetching inquiries");
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCount = async () => {
    try {
      const res = await fetch(`${API_URL}/customers/inquiries/count`, { credentials: "include" });
      if (!res.ok) return;
      const body = await res.json();
      setCount(Number(body?.total ?? 0));
    } catch (err) {
      console.error("Failed to fetch inquiries count", err);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchCount();
  }, []);

  const viewInquiry = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/customers/inquiries/${id}`, { credentials: "include" });
      if (!res.ok) return alert("Failed to fetch inquiry details");
      const data = await res.json();
      setActive(data);
    } catch {
      alert("Error fetching inquiry details");
    }
  };

  const sendReply = async () => {
    if (!active || !reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/customers/inquiries/${active._id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: reply }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      const data = await res.json();
      setActive(data.inquiry || active);
      setReply("");
      fetchInquiries();
    } catch (err: any) {
      alert(err.message || "Error sending reply");
    } finally {
      setSending(false);
    }
  };

  // New: Delete inquiry
  const confirmDelete = (id: string) => {
    setDeleteModal({ show: true, id });
  };

  const deleteInquiry = async () => {
    if (!deleteModal.id) return;
    try {
      const res = await fetch(`${API_URL}/customers/inquiries/${deleteModal.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete inquiry");

      alert("Inquiry deleted successfully");

      if (active?._id === deleteModal.id) setActive(null); // close modal if open
      fetchInquiries();
      fetchCount();
    } catch (err: any) {
      alert(err.message || "Error deleting inquiry");
    } finally {
      setDeleteModal({ show: false });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Customer Inquiries</h1>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Total inquiries: <span className="font-semibold">{count}</span>
        </div>
        <button onClick={() => { fetchInquiries(); fetchCount(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
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
                    <div className="text-sm text-gray-500">{inq.customer ? `${inq.customer.firstName ?? ""} ${inq.customer.lastName ?? ""}` : "Guest"}</div>
                  </div>
                  <div className="text-sm text-gray-400">{inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ""}</div>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">{inq.message}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => viewInquiry(inq._id)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">View</button>
                  <button onClick={() => confirmDelete(inq._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {inquiries.length === 0 && !loading && <div className="col-span-full text-center text-gray-500">No inquiries found</div>}
      </div>

      {/* Inquiry Modal */}
      {active && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-2">{active.subject}</h3>
            <div className="text-sm text-gray-600 mb-4">{active.createdAt ? new Date(active.createdAt).toLocaleString() : ""}</div>
            <div className="mb-4"><strong>From:</strong> {active.customer ? `${active.customer.firstName ?? ""} ${active.customer.lastName ?? ""} (${active.customer.email ?? "-"})` : "Guest"}</div>
            <div className="mb-4 text-gray-800">{active.message}</div>

            {active.replies && active.replies.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Replies</h4>
                {active.replies.map((r, idx) => (
                  <div key={idx} className="mb-2 p-2 bg-gray-100 rounded">
                    <div className="text-sm text-gray-600">{r.admin?.name || "Admin"} - {new Date(r.createdAt).toLocaleString()}</div>
                    <div className="text-gray-800">{r.message}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <input type="text" placeholder="Write a reply..." value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded" />
              <button onClick={sendReply} disabled={sending || !reply.trim()} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{sending ? "Sending..." : "Send"}</button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setActive(null)} className="px-3 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this inquiry? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button onClick={deleteInquiry} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              <button onClick={() => setDeleteModal({ show: false })} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerInquiry;
