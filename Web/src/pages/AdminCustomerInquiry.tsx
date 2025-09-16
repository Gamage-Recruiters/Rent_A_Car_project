import React from 'react';
import { inquiries } from '../data/mockData';
import { User } from 'lucide-react'; // import User icon from lucide-react

const AdminCustomerInquiry: React.FC = () => {
  return (
    <div className="flex">
      {/* Sidebar Placeholder */}
      <div className="w-1/4"></div>

      {/* Main Content */}
      <div className="flex-2 p-10 flex flex-col items-center">
        <h1 className='text-5xl mb-10 text-center font-bold'>
          Customers Inquiries Page
        </h1>

        {/* Inquiries Count */}
        <div className="w-full max-w-xl mb-8">
          <h1 className="text-2xl">
            Total Customer Inquiries ({inquiries.length})
          </h1>
        </div>

        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="w-full max-w-xl bg-white shadow-md rounded-xl p-4 mb-4"
          >
            <div className="flex items-center mb-3">
              {/* Profile image or User icon */}
              {inquiry.profileImage ? (
                <img
                  src={inquiry.profileImage}
                  alt={inquiry.fullName}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <User className="text-gray-500 w-6 h-6" />
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold">{inquiry.fullName}</h2>
                <p className="text-sm text-gray-500">{inquiry.email}</p>
                <p className="text-sm text-gray-500">{inquiry.phone}</p>
              </div>
            </div>
            <h3 className="font-medium">{inquiry.subject}</h3>
            <p className="text-gray-600">{inquiry.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCustomerInquiry;
