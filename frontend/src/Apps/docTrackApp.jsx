import { Box, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import axios from 'axios';

import Layout from '../components/layout.jsx';

import A_Dashboard from '../doc-track/pages/A_Dashboard.jsx';
import B_Incoming from '../doc-track/pages/B_Incoming.jsx';
import C_Pending from '../doc-track/pages/C_Pending.jsx';
import D_Outgoing from '../doc-track/pages/D_Outgoing.jsx';
import E_GenReports from '../doc-track/pages/E_GenReports.jsx';
import F_History from '../doc-track/pages/F_History.jsx';
import G_Staffs from '../doc-track/pages/G_Staffs.jsx';

import { useAuthStore } from '../auth/store/authStore.js';

const ProtectedRoute = ({children}) => {
    const {isAuthenticated, isCheckingAuth, user, checkAuth} = useAuthStore();

    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={'xl'} /><Text ml={4}>Please wait...</Text>
      </div>;
    }

    // If not authenticated or user is missing or 2FA not enabled, redirect
    if (!isAuthenticated || !user) {
      return <Navigate to='/auth/login' replace />;
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
                    <Route path="incoming" element={<B_Incoming />} />
                    <Route path="pending" element={<C_Pending />} />
                    <Route path="outgoing" element={<D_Outgoing />} />
                    <Route path="gen-reports" element={<E_GenReports />} />
                    <Route path="history" element={<F_History />} />
                    <Route path="staffs" element={<G_Staffs />} />
                </Route>    
            </Routes>
            
        </Box>
    );
};

export default doctrackApp