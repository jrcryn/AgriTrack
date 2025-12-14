import { Box } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SystemAdminLayout from '../components/systemAdminLayout.jsx';

// Import System Admin Pages
import Dashboard from '../system admin/Dashboard';
import UserManagement from '../system admin/UserManagement';
import RegisterEmployee from '../system admin/RegisterEmployee';
import RegisterSystemAdmin from '../system admin/RegisterSystemAdmin';
import ActionLogs from '../system admin/ActionLogs';

const SystemAdminApp = () => {
  return (
    <Box>
      <Routes>
        <Route path="/" element={<SystemAdminLayout />}>
          <Route index element={<Navigate to="/system-admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="register-employee" element={<RegisterEmployee />} />
          <Route path="register-admin" element={<RegisterSystemAdmin />} />
          <Route path="logs" element={<ActionLogs />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default SystemAdminApp;
