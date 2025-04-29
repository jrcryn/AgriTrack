import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Layout from '../doc-track/adminPages/Layout.jsx';

const doctrackApp = () => {
    return (
        <Box>
            <Routes>
                <Route path="admin" element={<Layout />}>

                </Route>    ``
            </Routes>
        </Box>
    );
};

export default doctrackApp