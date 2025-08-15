import AdminSidebar from '../components/AdminSideBar';

const AdminTestPage = () => {
  const handleNavigation = (path: string) => {
    console.log('Navigate to:', path);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar 
        currentRoute="/admin/dashboard"
        onNavigate={handleNavigation}
      />
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-2xl font-bold">Admin Sidebar Test</h1>
        <p>The sidebar is working! Check the left side.</p>
      </div>
    </div>
  );
};

export default AdminTestPage;