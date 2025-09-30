import { Box, Spinner, Text } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react';
import { useAuthStore } from '../auth/store/authStore.js'

import LoginPage from '../auth/authPages/loginPage.jsx'
import Setup2FA from '../auth/authPages/setup2FA.jsx'
import Verify2FA from '../auth/authPages/verify2FA.jsx'
import ForgotPassword from '../auth/authPages/forgotPassword.jsx'
import ResetPassword from '../auth/authPages/resetPassword.jsx'

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) {
      return null;
  }

  if (isAuthenticated) {

    if (!user.role) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={'xl'} /><Text ml={4}>Please wait...</Text>
      </div>;
    }

    const role = String(user?.role || '').trim().toUpperCase();

    if (role === 'HVCM' || role === 'HVCS') {
      return <Navigate to='/hvc/metrics' replace />;
    } else if (role === 'MIS') {
      return <Navigate to='/machineries/metrics' replace />;
    } else if (role === 'DMS') {
      return <Navigate to='/doc-track/register-document' replace />;
    } else if (role === 'DMM') {
      return <Navigate to='/doc-track/metrics' replace />;
    } else {
      return <Navigate to='/404' replace />;
    }
  }

  // User is not authenticated, so allow access to the auth pages
  return children;
};

const authApp = () => {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    return(
        <Box>

            <Routes>

                <Route path="login" element={
                    <RedirectAuthenticatedUser>
                        <LoginPage /> 
                    </RedirectAuthenticatedUser>
                } />

                
                <Route path="2fa/setup-2fa" element={
                    <RedirectAuthenticatedUser>
                        <Setup2FA />
                    </RedirectAuthenticatedUser>
                } />


                <Route path="2fa/verify-2fa" element={
                    <RedirectAuthenticatedUser>
                        <Verify2FA />
                    </RedirectAuthenticatedUser>
                } />

                <Route path="forgot-password" element={
                    <RedirectAuthenticatedUser>
                        <ForgotPassword />
                    </RedirectAuthenticatedUser>}
                 />

                <Route path="reset-password/:token" element={
                    <RedirectAuthenticatedUser>
                        <ResetPassword />
                    </RedirectAuthenticatedUser>}
                />

            </Routes>

        </Box>
    );
};

export default authApp