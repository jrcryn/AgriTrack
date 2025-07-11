import { Box, Spinner, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

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
    const {isAuthenticated, user, isCheckingAuth} = useAuthStore();

    if (isCheckingAuth) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={'xl'} /><Text ml={4}>Please wait...</Text>
      </div>;
    }

    if (!isAuthenticated || !user) {
      return <Navigate to='/auth/login' replace />;
    }

    return children;
}

const doctrackApp = () => {

    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    
    return (
        <Box>
            <ProtectedRoute>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="metrics" element={<A_Dashboard />} />
                    <Route path="incoming" element={<B_Incoming />} />
                    <Route path="pending" element={<C_Pending />} />
                    <Route path="outgoing" element={<D_Outgoing />} />
                    <Route path="gen-reports" element={<E_GenReports />} />
                    <Route path="history" element={<F_History />} />
                    <Route path="staffs" element={<G_Staffs />} />
                </Route>    
            </Routes>
            </ProtectedRoute>
        </Box>
    );
};

export default doctrackApp