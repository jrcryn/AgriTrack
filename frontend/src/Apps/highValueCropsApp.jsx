import { Box, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, useNavigationType, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/store/authStore.js';
import { useFormStatusCheck } from '../high-value-crops/store/farmerForm.store.js';
import axios from 'axios';

// User page imports
import Layout from '../components/layout.jsx';
import Metrics from '../high-value-crops/pages/A_Metrics.jsx';                                  
import HVCSaMPR from '../high-value-crops/pages/B_HVCSaMPR.jsx';
import HVCPR from '../high-value-crops/pages/C_HVCPR.jsx';
import Responses from '../high-value-crops/pages/D_Responses.jsx';
import Farmers from '../high-value-crops/pages/E_Farmers.jsx';
import ProfileSettings from '../components/profileSettings.jsx';

import FormClosedPage from '../components/formClosedPage.jsx';

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


//redirect authenticated users
const ProtectedRoute = ({children}) => {
    const {isAuthenticated, isCheckingAuth, user, checkAuth} = useAuthStore();

    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={'xl'} /><Text ml={4}>Please wait...</Text>
      </div>;
    }

    // If not authenticated or user is missing or 2FA not enabled, redirect
    if (!isAuthenticated || !user) {
      return <Navigate to='/auth/login' replace />;
    }

    return children;
};

const CheckFormStatus = ({children}) => {
  const { isFormOpen, isCheckingFormStatus } = useFormStatusCheck();


  if (isCheckingFormStatus) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spinner size={'xl'} /><Text ml={4}>Please wait...</Text>
    </div>;
  }

  if (isFormOpen) {
    return <Outlet/>;
  } else if (!isFormOpen) {
    return <Navigate to="/hvc/form/form-closed" replace />;
  }

  return children;
};

axios.interceptors.response.use(
  response => response,
  error => {
    const currentPath = window.location.pathname;
    if (
      error.response &&
      error.response.status === 401 &&
      !currentPath.startsWith('/auth') &&
      !currentPath.startsWith('/hvc/form') // ignore 401 while on public form pages
    ) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

const highValueCropsApp = () => {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const location = useLocation();

  const [selectedCropType, setSelectedCropType] = useState('');

  // PAGE DIRECTION CONTROLLER FOR FARMER FORM PAGES

  // this ref will flip to true whenever we do an in-app Next/Back
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    const isFormPath        = location.pathname.startsWith('/hvc/form/dpa') || location.pathname.startsWith('/hvc/form/a_fi') || location.pathname.startsWith('/hvc/form/b_ct') || location.pathname.startsWith('/hvc/form/c1_cri') || location.pathname.startsWith('/hvc/form/c2_cro') || location.pathname.startsWith('/hvc/form/d1_cih') || location.pathname.startsWith('/hvc/form/d1_cin') || location.pathname.startsWith('/hvc/form/d2_bc_ofh') || location.pathname.startsWith('/hvc/form/d2_bc_ofn') || location.pathname.startsWith('/hvc/form/success');
    const isInitialFormPath = location.pathname === '/hvc/form/istcns'
    
    // only on a true browser POP (refresh/direct URL) AND if we've never clicked Next/Back yet, redirect home
    if (
      navigationType === 'POP' &&
      isFormPath &&
      !isInitialFormPath &&
      !hasInteractedRef.current
    ) {
      navigate('/hvc/form/istcns', { replace: true });
    }
  }, [location.pathname, navigationType, navigate]);

  const handleNext = (path, cropType) => {
    hasInteractedRef.current = true; // Set the ref to true when navigating forward
    window.scrollTo(0, 0); // Scroll to top
    if (cropType) {
      setSelectedCropType(cropType);
    }
    navigate('/hvc/form' + path);
  };

  const handleBack = () => {
    hasInteractedRef.current = true; // Set the ref to true when navigating back
    window.scrollTo(0, 0); // Scroll to top
    navigate(-1);
  };

  // CHECK FORM STATUS
  const { checkFormStatus } = useFormStatusCheck();

  useEffect(() => {
    checkFormStatus();
  }, [checkFormStatus]);

  return (
    <Box>
      <Routes>

        {/* Protected HVC User Routes */}
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="metrics" element={<Metrics />} />
          <Route path="hvc-sampr" element={<HVCSaMPR />} />
          <Route path="hvc-pr" element={<HVCPR />} />
          <Route path="responses" element={<Responses />} />
          <Route path="farmers" element={<Farmers />} />
          <Route path="profile-settings" element={<ProfileSettings />} />
        </Route>

       
<Route path='/form/form-closed' element={<FormClosedPage />} />
<Route path='/form/istcns' element={<Instructions onNext={() => handleNext('/dpa')} />} />

        {/* Form Form Routes */}
        <Route path="form" element={<CheckFormStatus><Outlet /></CheckFormStatus>}>
          {/* <Route path='istcns' element={<Instructions onNext={() => handleNext('/dpa')} />} /> */}
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
