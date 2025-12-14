import { Box, Spinner, Text } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

import SystemAdminLayout from '../components/systemAdminLayout.jsx';
import { useAuthStore } from '../auth/store/authStore.js';

// Import System Admin Pages
import Dashboard from '../system admin/Dashboard';
import UserManagement from '../system admin/UserManagement';
import RegisterEmployee from '../system admin/RegisterEmployee';
import RegisterSystemAdmin from '../system admin/RegisterSystemAdmin';
import ActionLogs from '../system admin/ActionLogs';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth, user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={'xl'} />
        <Text ml={4}>Please wait...</Text>
      </div>
    );
  }

  // If not authenticated or user is missing, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to='/auth/login' replace />;
  }

  // Check if user is a system admin
  const isSystemAdmin = user.accountType === 'admin' || user.role === 'ADMIN';
  
  if (!isSystemAdmin) {
    // User is authenticated but not a system admin, redirect to their appropriate dashboard
    const role = String(user?.role || '').trim().toUpperCase();
    if (role === 'HVCM' || role === 'HVCS') {
      return <Navigate to='/hvc/metrics' replace />;
    } else if (role === 'DMM' || role === 'DMS') {
      return <Navigate to='/doc-track/metrics' replace />;
    } else if (role === 'MIM' || role === 'MIS') {
      return <Navigate to='/machineries/metrics' replace />;
    } else {
      return <Navigate to='/auth/login' replace />;
    }
  }

  return children;
};

// Axios interceptor to handle 401 errors and redirect to login
axios.interceptors.response.use(
  response => response,
  error => {
    const currentPath = window.location.pathname;
    if (
      error.response &&
      error.response.status === 401 &&
      !currentPath.startsWith('/auth')
    ) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

const SystemAdminApp = () => {
  return (
    <Box>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <SystemAdminLayout />
          </ProtectedRoute>
        }>
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
