import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Layout from '../machineries/pages/Layout.js';

import Metrics from '../machineries/pages/A_Metrics.js';
import MachineryInventory from '../machineries/pages/B_MachineInventory.js'
import GenReports from '../machineries/pages/C_GenReports.js';

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