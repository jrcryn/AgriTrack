import { Box } from '@chakra-ui/react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import A_farmerInputs from '../formPages/A_farmerInputs.jsx';
import B_cropTypes from '../formPages/B_cropTypes.jsx';
import C1_cropRecordsIndus from '../formPages/C1_cropRecordsIndus.jsx';
import C2_cropRecordsOther from '../formPages/C2_cropRecordsOther.jsx';

import React, { useState } from 'react'

const formApp = () => {
  
  const navigate = useNavigate();
  const [selectedCropType, setSelectedCropType] = useState('');

  const handleNext = (path, cropType) => {
    window.scrollTo(0,0); // Scroll to top
    if (cropType) {
      setSelectedCropType(cropType);
    }
    navigate(path);
  };

  const handleBack = () => {
    window.scrollTo(0,0); // Scroll to top
    navigate(-1);
  };

  return (
    <Box>
      <Routes>
          <Route path="a_fi" element={<A_farmerInputs onNext={() => handleNext('/b_ct')} />} />
          <Route path="b_ct" element={<B_cropTypes onNext={handleNext} onBack={handleBack} />} />
          <Route path="c_cri" element={<C1_cropRecordsIndus onNext={() => handleNext('/a_fi')} onBack={handleBack} />} />
          <Route path="c_cro" element={<C2_cropRecordsOther 
            onNext={() => handleNext('/a_fi')} 
            onBack={(handleBack)}
            cropType={selectedCropType}
          />} />
      </Routes>
    </Box>
  )
}

export default formApp