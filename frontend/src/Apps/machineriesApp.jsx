import { Box, Spinner, Text } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useNavigationType, useLocation } from 'react-router-dom'
import axios from 'axios';

import Layout from '../components/layout.jsx';

import A_Metrics from '../machineries/pages/A_Metrics.jsx';
import B_MachineryInventory from '../machineries/pages/B_MachineInventory.jsx'
import C_TicketRequests from '../machineries/pages/C_TicketRequests.jsx';
import D_TripTicketReturns from '../machineries/pages/D_TripTicketReturns.jsx';
import E_GenReports from '../machineries/pages/E_GenReports.jsx';
import F_Operators from '../machineries/pages/F_Operators.jsx';
import G_WeeklySchedules from '../machineries/pages/G_WeeklySchedules.jsx';

//form inports
import TicketRequestForm from '../machineries/pages/formPages/TicketRequestForm.jsx';
import Instructions from '../machineries/pages/formPages/Instructions.jsx';
import DataPrivacyAct from '../machineries/pages/formPages/DataPrivacyAct.jsx';
import SuccessPage from '../machineries/pages/formPages/SuccessPage.jsx';

import { useAuthStore } from '../auth/store/authStore.js';

const ProtectedRoute = ({children}) => {
    const {isAuthenticated, user, isCheckingAuth, checkAuth} = useAuthStore();

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
      !currentPath.startsWith('/auth') &&
      !currentPath.startsWith('/machineries/form') // ignore 403 while on public form pages
    ) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

const machineriesApp = () => {
    const navigate = useNavigate();
    const navigationType = useNavigationType();
    const location = useLocation();

    // PAGE DIRECTION CONTROLLER FOR FARMER FORM PAGES

    // this ref will flip to true whenever we do an in-app Next/Back
    const hasInteractedRef = useRef(false);

    useEffect(() => {
        const isFormPath        = location.pathname.startsWith('/machineries/form/dpa') || location.pathname.startsWith('/machineries/form/farmer-input') || location.pathname.startsWith('/machineries/form/ticket-request') || location.pathname.startsWith('/machineries/form/success');
        const isInitialFormPath = location.pathname === '/machineries/form/istcns'
        
        // Check if we're coming from the success page
        const isComingFromSuccess = sessionStorage.getItem('machinery_form_completed');
        
        // If we're coming from success, force a full page reload to reset all state
        if (isComingFromSuccess && (isFormPath && !location.pathname.startsWith('/machineries/form/success'))) {
            sessionStorage.removeItem('machinery_form_completed');
            window.location.reload();
            return;
        }
        
        // only on a true browser POP (refresh/direct URL) AND if we've never clicked Next/Back yet, redirect home
        if (
          navigationType === 'POP' &&
          isFormPath &&
          !isInitialFormPath &&
          !hasInteractedRef.current
        ) {
          navigate('/machineries/form/istcns', { replace: true });
        }
    }, [location.pathname, navigationType, navigate]);

    const handleNext = (path, state = {}) => {
        hasInteractedRef.current = true; // Set the ref to true when navigating forward
        window.scrollTo(0, 0); // Scroll to top
        navigate('/machineries/form' + path, state);
    };

    const handleBack = () => {
        hasInteractedRef.current = true; // Set the ref to true when navigating back
        window.scrollTo(0, 0); // Scroll to top
        navigate(-1);
    };

    return (
        <Box>
            
            <Routes>
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                   <Route path="metrics" element={<A_Metrics />} />
                   <Route path="machine-inventory" element={<B_MachineryInventory />} />
                   <Route path="ticket-requests" element={<C_TicketRequests />} />
                   <Route path="weekly-schedules" element={<G_WeeklySchedules />} />
                   <Route path="trip-ticket-returns" element={<D_TripTicketReturns />} />
                   <Route path="gen-reports" element={<E_GenReports />} />
                   <Route path="operators" element={<F_Operators />} />
                </Route>   


                 {/*ticket request form*/}

                 <Route path="/form/istcns" element={<Instructions onNext={() => handleNext('/dpa')} />} />

                 <Route path="form">
                  <Route path="dpa" element={<DataPrivacyAct onNext={() => handleNext('/ticket-request')} onBack={handleBack} />} />
                  <Route path="ticket-request" element={<TicketRequestForm onNext={(state) => handleNext('/success', state)} onBack={handleBack} />} />
                  <Route path="success" element={<SuccessPage />} />
                 </Route>
            </Routes>
            
        </Box>
    );
};

export default machineriesApp