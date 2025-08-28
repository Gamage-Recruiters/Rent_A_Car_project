import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  type: 'owner' | 'customer';
  registeredDate: string;
}

const dummyOwners: User[] = [
  { id: 1, name: 'John Smith', email: 'john.smith@example.com', phone: '0771234567', status: 'verify', type: 'owner', registeredDate: '2024-01-15' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '0777654321', status: 'suspend', type: 'owner', registeredDate: '2024-02-08' },
  { id: 3, name: 'Michael Brown', email: 'michael.brown@example.com', phone: '0773456789', status: 'verify', type: 'owner', registeredDate: '2024-03-12' },
  { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', phone: '0778901234', status: 'delete', type: 'owner', registeredDate: '2024-01-28' },
  { id: 5, name: 'David Wilson', email: 'david.wilson@example.com', phone: '0775678901', status: 'verify', type: 'owner', registeredDate: '2024-04-05' },
  { id: 6, name: 'Eva Green', email: 'eva.green@example.com', phone: '0775678999', status: 'verify', type: 'owner', registeredDate: '2024-04-08' },
];

const dummyCustomers: User[] = [
  { id: 7, name: 'Alice Cooper', email: 'alice.cooper@example.com', phone: '0711111111', status: 'verify', type: 'customer', registeredDate: '2024-02-20' },
  { id: 8, name: 'Bob Martinez', email: 'bob.martinez@example.com', phone: '0712222222', status: 'delete', type: 'customer', registeredDate: '2024-03-15' },
  { id: 9, name: 'Clara Thompson', email: 'clara.t@example.com', phone: '0713333333', status: 'suspend', type: 'customer', registeredDate: '2024-01-10' },
  { id: 10, name: 'Daniel Lee', email: 'daniel.lee@example.com', phone: '0714444444', status: 'verify', type: 'customer', registeredDate: '2024-04-02' },
  { id: 11, name: 'Emma Garcia', email: 'emma.garcia@example.com', phone: '0715555555', status: 'verify', type: 'customer', registeredDate: '2024-03-28' },
  { id: 12, name: 'neku kayomi', email: 'neku.kayomi@example.com', phone: '0716666666', status: 'verify', type: 'customer', registeredDate: '2024-03-31' },
];

const ManageAccounts: React.FC = () => {
  const [view, setView] = useState<'owner' | 'customer'>('owner');
  const [owners, setOwners] = useState<User[]>(dummyOwners);
  const [customers, setCustomers] = useState<User[]>(dummyCustomers);

  const handleStatusChange = (userType: 'owner' | 'customer', id: number, newStatus: string) => {
    const updater = userType === 'owner' ? setOwners : setCustomers;
    const currentData = userType === 'owner' ? owners : customers;

    const updated = currentData.map((user) =>
      user.id === id ? { ...user, status: newStatus } : user
    );

    updater(updated);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verify':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suspend':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderTable = (data: User[], type: 'owner' | 'customer') => (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
             <tr className="bg-gray-200 border-b border-gray-300">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Registered Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((user, index) => (
              <tr key={user.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-600">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-600 font-mono">{user.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    user.type === 'owner' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {user.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-600">{new Date(user.registeredDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(type, user.id, e.target.value)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${getStatusColor(user.status)}`}
                  >
                    <option value="verify">Verify</option>
                    <option value="suspend">Suspend</option>
                    <option value="delete">Delete</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 pb-1">
            Account Management Dashboard
          </h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setView('owner')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  view === 'owner'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Owner Details
              </button>
              <button
                onClick={() => setView('customer')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  view === 'customer'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Customer Details
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              Total {view} Accounts ({view === 'owner' ? owners.length : customers.length})
            </h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Suspended</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Deleted</span>
              </div>
            </div>
          </div>
        </div>

        {view === 'owner' ? renderTable(owners, 'owner') : renderTable(customers, 'customer')}
      </div>
    </div>
  );
};

export default ManageAccounts;