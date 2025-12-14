import { Routes, Route, Navigate } from 'react-router-dom';

// Import Sidebar Component
import SidebarHeaderSystemAdmin from '../components/sidebarHeaderSystemAdmin';

// Import System Admin Pages
import Dashboard from '../system admin/Dashboard';
import UserManagement from '../system admin/UserManagement';
import RegisterEmployee from '../system admin/RegisterEmployee';
import RegisterSystemAdmin from '../system admin/RegisterSystemAdmin';
import ActionLogs from '../system admin/ActionLogs';

const SystemAdminApp = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarHeaderSystemAdmin />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/system-admin/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/register-employee" element={<RegisterEmployee />} />
          <Route path="/register-admin" element={<RegisterSystemAdmin />} />
          <Route path="/logs" element={<ActionLogs />} />
        </Routes>
      </main>
    </div>
  );
};

export default SystemAdminApp;
