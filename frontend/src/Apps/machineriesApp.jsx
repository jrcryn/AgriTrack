import { Box, Spinner, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from '../components/layout.jsx';

import Metrics from '../machineries/pages/A_Metrics.jsx';
import MachineryInventory from '../machineries/pages/B_MachineInventory.jsx'
import GenReports from '../machineries/pages/C_GenReports.jsx';

import { useAuthStore } from '../auth/store/authStore.js';

const ProtectedRoute = ({children}) => {
    const {isAuthenticated, user, isCheckingAuth} = useAuthStore();

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

const machineriesApp = () => {

    // CHECK AUTHENTICATION STATUS
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Box>
            <ProtectedRoute>
            <Routes>
                <Route path="/" element={<Layout />}>
                   <Route path="metrics" element={<Metrics/>} />
                   <Route path="machine-inventory" element={<MachineryInventory/>} />
                   <Route path="gen-reports" element={<GenReports/>} />
                </Route>    
            </Routes>
            </ProtectedRoute>
        </Box>
    );
};

export default machineriesApp