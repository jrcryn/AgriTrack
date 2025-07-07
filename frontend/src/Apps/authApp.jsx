import { Box } from '@chakra-ui/react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import LoginPage from '../authPages/loginPage.jsx'
import Setup2FA from '../authPages/setup2FA.jsx'
import Verify2FA from '../authPages/verify2FA.jsx'
import ForgotPassword from '../authPages/forgotPassword.jsx'
import ResetPassword from '../authPages/resetPassword.jsx'

const authApp = () => {
    return(
        <Box>
            <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="2fa/setup-2fa" element={<Setup2FA />} />
                <Route path="2fa/verify-2fa" element={<Verify2FA />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
            </Routes>
        </Box>
    );
};

export default authApp