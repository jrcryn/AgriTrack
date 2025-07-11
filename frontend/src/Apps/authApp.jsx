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
     if (user.role === 'HVCM' || user.role === 'HVCS') {
      return <Navigate to='/hvc/metrics' replace />;
    } else if (user.role === 'MIS') {
      return <Navigate to='/machineries/metrics' replace />;
    } else if (user.role === 'DMM' || user.role === 'DMS') {
      return <Navigate to='/doc-track/metrics' replace />;
    } else {
      return <Navigate to='/404' replace />;
    }
  }

  // User is not authenticated, so allow access to the auth pages
  return children;
};

const authApp = () => {
    const { checkPreAuth, checkAuth } = useAuthStore();

    useEffect(() => {
      checkPreAuth();
      checkAuth();
    }, []);

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