import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Layout from '../components/layout.jsx';

import Metrics from '../machineries/pages/A_Metrics.jsx';
import MachineryInventory from '../machineries/pages/B_MachineInventory.jsx'
import GenReports from '../machineries/pages/C_GenReports.jsx';

const machineriesApp = () => {
    return (
        <Box>
            <Routes>
                <Route path="/" element={<Layout />}>
                   <Route path="metrics" element={<Metrics/>} />
                   <Route path="machine-inventory" element={<MachineryInventory/>} />
                   <Route path="gen-reports" element={<GenReports/>} />
                </Route>    
            </Routes>
        </Box>
    );
};

export default machineriesApp