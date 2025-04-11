import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'
import Layout from '../machineries/Layout';
import TestPage from '../machineries/testPage';

const machineriesApp = () => {
    return (
        <Box>
            <Routes>
                <Route path="admin" element={<Layout />}>
                   <Route path="test" element={<TestPage />} />
                </Route>
            </Routes>
        </Box>
    );
};

export default machineriesApp