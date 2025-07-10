import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HighValueCrops from './Apps/highValueCropsApp.jsx';
import Machineries from './Apps/machineriesApp.jsx'
import DocTrack from './Apps/docTrackApp.jsx'
import Auth from './Apps/authApp.jsx'
import { useEffect } from 'react';
import { useAuthStore } from './auth/store/authStore.js';

const queryClient = new QueryClient();

function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return <div>Please Wait...</div>;
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
