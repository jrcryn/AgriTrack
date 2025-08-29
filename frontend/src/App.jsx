import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react';
import axios from 'axios';

import HighValueCrops from './Apps/highValueCropsApp.jsx';
import Machineries from './Apps/machineriesApp.jsx'
import DocTrack from './Apps/docTrackApp.jsx'
import Auth from './Apps/authApp.jsx'

import Maintenance from './components/maintenance.jsx';

const queryClient = new QueryClient();

if (import.meta.env.VITE_FRONTEND_ENV === "production") {
  console.log(
    '%c🚫 Warning!',
    'color: red; font-size: 24px; font-weight: bold;'
  );
  console.log(
    '%cAny attempt to tamper with the system may be logged.',
    'font-size: 14px; font-style: italic; color: red;'
  );
}

function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 503) {
          setIsMaintenance(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on component unmount
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/hvc/*" element={<HighValueCrops />} />
        <Route path="/machineries/*" element={<Machineries />} />
        <Route path="/doc-track/*" element={<DocTrack/>} />
        <Route path="/auth/*" element={<Auth/>} />``
      </Routes>
    </QueryClientProvider>
  )
}

export default App
