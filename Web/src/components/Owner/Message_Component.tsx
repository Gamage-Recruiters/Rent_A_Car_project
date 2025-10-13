import React from "react";

const Message_Component: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Messages</h3>

      <div className="space-y-4">
        {/* Message 1 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">John Smith</h4>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <p className="text-gray-600 mb-2">
            Hi, I'm interested in booking your Toyota Camry for next weekend. Is
            it available?
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm">
            Reply
          </button>
        </div>

        {/* Message 2 */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          <p className="text-gray-600 mb-2">
            Thank you for the great car! Everything went smoothly.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message_Component;
