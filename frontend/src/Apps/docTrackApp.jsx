import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'

import Layout from '../doc-track/adminPages/Layout.jsx';

import A_Dashboard from '../doc-track/adminPages/A_Dashboard.jsx';
import B_Incoming from '../doc-track/adminPages/B_Incoming.jsx';
import C_Pending from '../doc-track/adminPages/C_Pending.jsx';
import D_Outgoing from '../doc-track/adminPages/D_Outgoing.jsx';
import E_GenReports from '../doc-track/adminPages/E_GenReports.jsx';
import F_History from '../doc-track/adminPages/F_History.jsx';
import G_Staffs from '../doc-track/adminPages/G_Staffs.jsx';

const doctrackApp = () => {
    return (
        <Box>
            <Routes>
                <Route path="admin" element={<Layout />}>
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