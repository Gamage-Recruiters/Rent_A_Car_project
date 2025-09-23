// src/components/StatsCard.tsx

import React from "react";

type Props = {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
};

const StatsCard: React.FC<Props> = ({ label, value, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</h3>
        <div className="p-3 rounded-lg bg-blue-50">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    </div>
  );
};

export default StatsCard;
