import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Layout from '../machineries/adminPages/Layout.jsx';

import Metrics from '../machineries/adminPages/A_Metrics.jsx';
import MachineryInventory from '../machineries/adminPages/B_MachineInventory.jsx'
import GenReports from '../machineries/adminPages/C_GenReports.jsx';
import AddMachinery from '../machineries/adminPages/D_AddMachinery.jsx';
import TransferUnits from '../machineries/adminPages/E_TransferUnits.jsx';

const machineriesApp = () => {
    return (
        <Box>
            <Routes>
                <Route path="admin" element={<Layout />}>
                   <Route path="metrics" element={<Metrics/>} />
                   <Route path="machine-inventory" element={<MachineryInventory/>} />
                   <Route path="gen-reports" element={<GenReports/>} />
                   <Route path="add-machinery" element={<AddMachinery/>} />
                   <Route path="transfer-units" element={<TransferUnits/>} />
                </Route>    
            </Routes>
        </Box>
    );
};

export default machineriesApp