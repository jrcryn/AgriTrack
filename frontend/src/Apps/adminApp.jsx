import { Box } from '@chakra-ui/react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../adminPages/Layout.jsx';

import Dashboard from '../adminPages/A_Dashboard.jsx';
import Metrics from '../adminPages/B_Metrics.jsx';
import GenReports from '../adminPages/C_GenReports.jsx';
import Responses from '../adminPages/D_Responses.jsx';
import Farmers from '../adminPages/E_Farmers.jsx';


const AdminApp = () => {
  return (
    <Box>
      <Layout>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="metrics" element={<Metrics />} />
          <Route path="gen-reports" element={<GenReports />} />
          <Route path="responses" element={<Responses />} />
          <Route path="farmers" element={<Farmers />} />
        </Routes>
      </Layout>
    </Box>
  );
};

export default AdminApp;
