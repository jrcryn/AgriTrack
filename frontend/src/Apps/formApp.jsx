import { Box } from '@chakra-ui/react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import A_farmerInputs from '../formPages/A_farmerInputs.jsx';
import B_cropTypes from '../formPages/B_cropTypes.jsx';
import C1_cropRecordsIndus from '../formPages/C1_cropRecordsIndus.jsx';
import C2_cropRecordsOther from '../formPages/C2_cropRecordsOther.jsx';
import D1_cropIndusHarvest from '../formPages/D1_cropIndusHarvest.jsx';
import D1_cropIndusNew from '../formPages/D1_cropIndusNew.jsx';
import D2_bc_Other_fctHarvest from '../formPages/D2_bc-other-fctHarvest.jsx';
import D2_bc_Other_fctNew from '../formPages/D2_bc-other-fctNew.jsx';
import SuccessPage from '../formPages/E_successPage.jsx';

import React, { useState } from 'react'

const formApp = () => {
  
  const navigate = useNavigate();
  const [selectedCropType, setSelectedCropType] = useState('');

  const handleNext = (path, cropType) => {
    window.scrollTo(0,0); // Scroll to top
    if (cropType) {
      setSelectedCropType(cropType);
    }
    navigate('/form' + path);
  };

  const handleBack = () => {
    window.scrollTo(0,0); // Scroll to top
    navigate(-1);
  };

  return (
    <Box>
      <Routes>
          <Route path='a_fi' element={<A_farmerInputs
          onNext={() => handleNext('/b_ct')} 
          />} />

          <Route path='b_ct' element={<B_cropTypes
          onNext={handleNext} 
          onBack={handleBack} 
          />} />

          <Route path='c1_cri' element={<C1_cropRecordsIndus
          onNext={handleNext} 
          onBack={handleBack} 
          />} />

          <Route path='c2_cro' element={<C2_cropRecordsOther
            onNext={handleNext} 
            onBack={handleBack}
            cropType={selectedCropType}
          />} />

          <Route path='d1_cih' element={<D1_cropIndusHarvest 
            onNext={handleNext}
            onBack={handleBack}
          />} />

          <Route path='d1_cin' element={<D1_cropIndusNew 
            onNext={handleNext}
            onBack={handleBack}
          />} />

          <Route path='d2_bc_ofh' element={<D2_bc_Other_fctHarvest 
            onNext={handleNext}
            onBack={handleBack}
          />} />

          <Route path='d2_bc_ofn' element={<D2_bc_Other_fctNew 
            onNext={handleNext}
            onBack={handleBack}
          />} />
          
          <Route path='success' element={<SuccessPage />} />
      </Routes>
    </Box>
  )
}

export default formApp