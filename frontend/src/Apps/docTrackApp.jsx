import { Box, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import axios from 'axios';

import Layout from '../components/layout.jsx';

import A_Dashboard from '../doc-track/pages/A_Dashboard.jsx';
import B_RegisterDocument from '../doc-track/pages/B_RegisterDocument.jsx';
import C_Incoming from '../doc-track/pages/C_Incoming.jsx';
import D_Pending from '../doc-track/pages/D_Pending.jsx';
import E_Outgoing from '../doc-track/pages/E_Outgoing.jsx';
import F_DocumentLogs from '../doc-track/pages/F_DocumentLogs.jsx';
import G_Staffs from '../doc-track/pages/G_Staffs.jsx';

import { useAuthStore } from '../auth/store/authStore.js';

const ProtectedRoute = ({children}) => {
  const {isAuthenticated, isCheckingAuth, user, checkAuth} = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spinner size={'xl'} /><Text ml={4}>Please wait...</Text>
    </div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to='/auth/login' replace />;
  }

  // Normalize role and make sure DMS staff does not land on /doc-track/metrics
  const role = String(user?.role || '').trim().toUpperCase();
  const path = location.pathname;
  if (role === 'DMS') {
    if (path === '/doc-track' || path === '/doc-track/' || path.startsWith('/doc-track/metrics')) {
      return <Navigate to='/doc-track/register-document' replace />;
    }
  }

  return children;
}

axios.interceptors.response.use(
  response => response,
  error => {
    // Prevent infinite redirect loop, dati kasi nag re-redirect parin after makapunta na sa login page
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

const doctrackApp = () => {
  return (
    <Box>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="metrics" element={<A_Dashboard />} />
          <Route path="register-document" element={<B_RegisterDocument />} />
          <Route path="incoming" element={<C_Incoming />} />
          <Route path="pending" element={<D_Pending />} />
          <Route path="outgoing" element={<E_Outgoing />} />
          <Route path="document-logs" element={<F_DocumentLogs />} />
          <Route path="employees" element={<G_Staffs />} />
        </Route>    
      </Routes>
    </Box>
  );
};

export default doctrackApp