import { Box } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import A_farmerInputs from '../formPages/A_farmerInputs.jsx';
import B_cropTypes from '../formPages/B_cropTypes.jsx';
import C_cropRecords from '../formPages/C_cropRecordsIndus.jsx';

import React from 'react'

const formApp = () => {
  return (
    <Box>
      <Routes>
          <Route path="a_fi" element={<A_farmerInputs/>} />
          <Route path="b_ct" element={<B_cropTypes/>} />
          <Route path="c_cr" element={<C_cropRecords/>} />
      </Routes>
    </Box>
  )
}

export default formApp