import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Layout from '../doc-track/pages/Layout.js';

import A_Dashboard from '../doc-track/ages/A_Dashboard.jsx';
import B_Incoming from '../doc-track/pages/B_Incoming.js';
import C_Pending from '../doc-track/pages/C_Pending.js';
import D_Outgoing from '../doc-track/pages/D_Outgoing.js';
import E_GenReports from '../doc-track/pages/E_GenReports.js';
import F_History from '../doc-track/pages/F_History.js';
import G_Staffs from '../doc-track/pages/G_Staffs.js';

const doctrackApp = () => {
    return (
        <Box>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="metrics" element={<A_Dashboard />} />
                    <Route path="incoming" element={<B_Incoming />} />
                    <Route path="pending" element={<C_Pending />} />
                    <Route path="outgoing" element={<D_Outgoing />} />
                    <Route path="gen-reports" element={<E_GenReports />} />
                    <Route path="history" element={<F_History />} />
                    <Route path="staffs" element={<G_Staffs />} />
                </Route>    
            </Routes>
        </Box>
    );
};

export default doctrackApp