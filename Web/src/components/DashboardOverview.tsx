// // src/components/DashboardOverview.tsx


// import React, { useEffect, useState } from "react";
// import StatsCard from "./StatsCard"; // Correct import assuming both files are in the same folder

// import { Users, UserCircle, Shield, UserCog, Clock } from "lucide-react";

// // Example API function to fetch metrics
// const fetchMetrics = async () => {
//   try {
//     const response = await fetch("/api/admin/metrics", { credentials: "include" });
//     const data = await response.json();
//     return data; // Assuming data is structured { total_users, total_owners, etc. }
//   } catch (error) {
//     console.error("Error fetching metrics", error);
//     return null;
//   }
// };

// const DashboardOverview: React.FC = () => {
//   const [metricsData, setMetricsData] = useState<any>(null);

//   const [recentActivities, setRecentActivities] = useState<any[]>([]);


//   useEffect(() => {
//     fetchMetrics().then((data) => {
//       setMetricsData(data);
//     });
//   }, []);

//   const handleBulkAction = async (action: string) => {
//   try {
//     const response = await fetch(`/api/admin/quick-actions?type=${action}`, { 
//       method: "POST", 
//       credentials: "include" 
//     });
//     const result = await response.json();
//     console.log(result);
//     // Optionally, show a success message or re-fetch activities
//   } catch (error) {
//     console.error("Error in bulk action", error);
//   }
// };


// useEffect(() => {
//   const fetchRecentActivities = async () => {
//     try {
//       const response = await fetch("/api/admin/recent-activities", { credentials: "include" });
//       const data = await response.json();
//       setRecentActivities(data); // Assuming the data is an array of activities
//     } catch (error) {
//       console.error("Error fetching recent activities", error);
//     }
//   };

//   fetchRecentActivities();
// }, []);

//   if (!metricsData) {
//     return <div>Loading...</div>; // Optionally, you can show a loading spinner or skeleton
//   }

//   const metrics = [
//     { title: "Total Users", value: metricsData.total_users, icon: <Users className="h-6 w-6 text-blue-600" /> },
//     { title: "Total Owners", value: metricsData.total_owners, icon: <UserCircle className="h-6 w-6 text-green-600" /> },
//     { title: "Approved Owners", value: metricsData.approved_owners, icon: <Shield className="h-6 w-6 text-purple-600" /> },
//     { title: "Total Customers", value: metricsData.total_customers, icon: <UserCog className="h-6 w-6 text-orange-600" /> },
//     { title: "Total Admins", value: metricsData.total_admins, icon: <UserCircle className="h-6 w-6 text-red-600" /> },
//     { title: "Total Pending Req", value: metricsData.total_pending_req, icon: <Clock className="h-6 w-6 text-yellow-600" /> },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//       {metrics.map((metric, index) => {
//         return (
//           <StatsCard
//             key={index}
//             label={metric.title}
//             value={metric.value}
//             icon={metric.icon}
//           />
//         );
//       })}

//       {/* Recent Activities Section */}
//       <div className="mt-8">
//   <h3 className="text-xl font-semibold">Recent Activities</h3>
//   <ul className="space-y-4">
//     {recentActivities.map((activity) => (
//       <li key={activity.id} className="flex justify-between items-center p-4 border border-gray-300 rounded-lg">
//         <span>{activity.message}</span> {/* Example: "New user registration" */}
//         <div className="flex space-x-2">
//           <button className="bg-green-500 text-white px-4 py-2 rounded-md">Approve</button>
//           <button className="bg-red-500 text-white px-4 py-2 rounded-md">Reject</button>
//         </div>
//       </li>
//     ))}
//   </ul>
// </div>

//     {/* <div className="mt-8">
//       <h3 className="text-xl font-semibold">Recent Activities</h3>
//       <ul className="space-y-4">
//         {recentActivities.map((activity) => (
//           <li key={activity.id} className="flex justify-between items-center p-4 border border-gray-300 rounded-lg">
//             <span>{activity.message}</span> {/* Example: "New user registration" */}
//             {/* <div className="flex space-x-2">
//               <button className="bg-green-500 text-white px-4 py-2 rounded-md">Approve</button>
//               <button className="bg-red-500 text-white px-4 py-2 rounded-md">Reject</button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div> */} 


//     {/* Quick Actions Section */}
//     <div className="mt-8">
//   <h3 className="text-xl font-semibold">Quick Actions</h3>
//   <div className="flex space-x-4">
//     <button 
//       onClick={() => handleBulkAction("approve_all")}
//       className="bg-blue-500 text-white px-6 py-3 rounded-md"
//     >
//       Approve All
//     </button>
//     <button 
//       onClick={() => handleBulkAction("reject_all")}
//       className="bg-yellow-500 text-white px-6 py-3 rounded-md"
//     >
//       Reject All
//     </button>
//   </div>
// </div>

//     {/* <div className="mt-8">
//       <h3 className="text-xl font-semibold">Quick Actions</h3>
//       <div className="flex space-x-4">
//         <button className="bg-blue-500 text-white px-6 py-3 rounded-md">Approve All</button>
//         <button className="bg-yellow-500 text-white px-6 py-3 rounded-md">Reject All</button>
//       </div>
//     </div> */}

    
//     </div>

  

//   );
// };

// export default DashboardOverview;

import React, { useEffect, useState } from "react";
import StatsCard from "./StatsCard"; // Import the StatsCard component
import { Users, UserCircle, Shield, UserCog, Clock } from "lucide-react";

// Function to fetch metrics
const fetchMetrics = async () => {
  try {
    const response = await fetch("/api/admin/metrics", { credentials: "include" });
    return await response.json();
  } catch (error) {
    console.error("Error fetching metrics", error);
    return null;
  }
};

const DashboardOverview: React.FC = () => {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchMetrics().then((data) => {
      setMetricsData(data);
    });
  }, []);

  const handleBulkAction = async (action: string) => {
    try {
      const response = await fetch(`/api/admin/quick-actions?type=${action}`, { 
        method: "POST", 
        credentials: "include" 
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Error in bulk action", error);
    }
  };

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await fetch("/api/admin/recent-activities", { credentials: "include" });
        const data = await response.json();
        setRecentActivities(data);
      } catch (error) {
        console.error("Error fetching recent activities", error);
      }
    };

    fetchRecentActivities();
  }, []);

  if (!metricsData) {
    return <div>Loading...</div>;
  }

  const metrics = [
    { title: "Total Users", value: metricsData.total_users, icon: <Users className="h-6 w-6 text-blue-600" /> },
    { title: "Total Owners", value: metricsData.total_owners, icon: <UserCircle className="h-6 w-6 text-green-600" /> },
    { title: "Approved Owners", value: metricsData.approved_owners, icon: <Shield className="h-6 w-6 text-purple-600" /> },
    { title: "Total Customers", value: metricsData.total_customers, icon: <UserCog className="h-6 w-6 text-orange-600" /> },
    { title: "Total Admins", value: metricsData.total_admins, icon: <UserCircle className="h-6 w-6 text-red-600" /> },
    { title: "Total Pending Req", value: metricsData.total_pending_req, icon: <Clock className="h-6 w-6 text-yellow-600" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <StatsCard key={index} label={metric.title} value={metric.value} icon={metric.icon} />
      ))}

      {/* Recent Activities */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">Recent Activities</h3>
        <ul className="space-y-4">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="flex justify-between items-center p-4 border border-gray-300 rounded-lg">
              <span>{activity.message}</span>
              <div className="flex space-x-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded-md">Approve</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded-md">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">Quick Actions</h3>
        <div className="flex space-x-4">
          <button onClick={() => handleBulkAction("approve_all")} className="bg-blue-500 text-white px-6 py-3 rounded-md">
            Approve All
          </button>
          <button onClick={() => handleBulkAction("reject_all")} className="bg-yellow-500 text-white px-6 py-3 rounded-md">
            Reject All
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
