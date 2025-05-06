import { Box } from '@chakra-ui/react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import LoginPage from '../authPages/loginPage.jsx'

const authApp = () => {
    return(
        <Box>
            <Routes>
                <Route path="login" element={<LoginPage />} />
            </Routes>
        </Box>
    );
};

export default authApp