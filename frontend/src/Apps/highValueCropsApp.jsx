import { Box } from '@chakra-ui/react';
import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, useNavigationType, useLocation } from 'react-router-dom';

// Admin imports
import Layout from '../high-value-crops/adminPages/Layout.jsx';
import Metrics from '../high-value-crops/adminPages/B_Metrics.jsx';
import GenReports from '../high-value-crops/adminPages/C_GenReports.jsx';
import Responses from '../high-value-crops/adminPages/D_Responses.jsx';
import Farmers from '../high-value-crops/adminPages/E_Farmers.jsx';

// Form imports
import Instructions from '../high-value-crops/formPages/Instructions.jsx';
import DataPrivacyAct from '../high-value-crops/formPages/DataPrivacyAct.jsx';
import A_farmerInputs from '../high-value-crops/formPages/A_farmerInputs.jsx';
import B_cropTypes from '../high-value-crops/formPages/B_cropTypes.jsx';
import C1_cropRecordsIndus from '../high-value-crops/formPages/C1_cropRecordsIndus.jsx';
import C2_cropRecordsOther from '../high-value-crops/formPages/C2_cropRecordsOther.jsx';
import D1_cropIndusHarvest from '../high-value-crops/formPages/D1_cropIndusHarvest.jsx';
import D1_cropIndusNew from '../high-value-crops/formPages/D1_cropIndusNew.jsx';
import D2_bc_Other_fctHarvest from '../high-value-crops/formPages/D2_bc-other-fctHarvest.jsx';
import D2_bc_Other_fctNew from '../high-value-crops/formPages/D2_bc-other-fctNew.jsx';
import SuccessPage from '../high-value-crops/formPages/E_successPage.jsx';

const highValueCropsApp = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const location = useLocation();

  const [selectedCropType, setSelectedCropType] = useState('');

  // this ref will flip to true whenever we do an in-app Next/Back
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    const isFormPath        = location.pathname.startsWith('/agritrack/hvc/form');
    const isInitialFormPath = location.pathname === '/agritrack/hvc/form/istcns';

    // only on a true browser POP (refresh/direct URL) AND
    // if we've never clicked Next/Back yet, redirect home
    if (
      navigationType === 'POP' &&
      isFormPath &&
      !isInitialFormPath &&
      !hasInteractedRef.current
    ) {
      navigate('/agritrack/hvc/form/istcns', { replace: true });
    }
  }, [location.pathname, navigationType, navigate]);

  const handleNext = (path, cropType) => {
    hasInteractedRef.current = true; // Set the ref to true when navigating forward
    window.scrollTo(0, 0); // Scroll to top
    if (cropType) {
      setSelectedCropType(cropType);
    }
    navigate('/agritrack/hvc/form' + path);
  };

  const handleBack = () => {
    hasInteractedRef.current = true; // Set the ref to true when navigating back
    window.scrollTo(0, 0); // Scroll to top
    navigate(-1);
  };

  return (
    <Box>
      <Routes>
        {/* Admin Routes */}
        <Route path="admin" element={<Layout />}>
          <Route path="metrics" element={<Metrics />} />
          <Route path="gen-reports" element={<GenReports />} />
          <Route path="responses" element={<Responses />} />
          <Route path="farmers" element={<Farmers />} />
         
        </Route>

        {/* Form Routes */}
        <Route path="form">
          <Route path='istcns' element={<Instructions onNext={() => handleNext('/dpa')} />} />
          <Route path='dpa' element={<DataPrivacyAct onNext={() => handleNext('/a_fi')} onBack={handleBack} />} />
          <Route path='a_fi' element={<A_farmerInputs onNext={() => handleNext('/b_ct')} onBack={handleBack} />} />
          <Route path='b_ct' element={<B_cropTypes onNext={handleNext} onBack={handleBack} />} />
          <Route path='c1_cri' element={<C1_cropRecordsIndus onNext={handleNext} onBack={handleBack} />} />
          <Route path='c2_cro' element={<C2_cropRecordsOther onNext={handleNext} onBack={handleBack} cropType={selectedCropType} />} />
          <Route path='d1_cih' element={<D1_cropIndusHarvest onNext={handleNext} onBack={handleBack} />} />
          <Route path='d1_cin' element={<D1_cropIndusNew onNext={handleNext} onBack={handleBack} />} />
          <Route path='d2_bc_ofh' element={<D2_bc_Other_fctHarvest onNext={handleNext} onBack={handleBack} />} />
          <Route path='d2_bc_ofn' element={<D2_bc_Other_fctNew onNext={handleNext} onBack={handleBack} />} />
          <Route path='success' element={<SuccessPage />} />
        </Route>
      </Routes>
    </Box>
  );
};

export default highValueCropsApp;
