import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react';

import HighValueCrops from './Apps/highValueCropsApp.jsx';
import Machineries from './Apps/machineriesApp.jsx'
import DocTrack from './Apps/docTrackApp.jsx'
import Auth from './Apps/authApp.jsx'

import SystemAdminApp from './Apps/systemAdminApp.jsx';

import Maintenance from './components/maintenance.jsx';
import AutoRefreshErrorBoundary from './components/AutoRefreshErrorBoundary.jsx';

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <AutoRefreshErrorBoundary>
      <Routes>
        <Route path="/hvc/*" element={<HighValueCrops />} />
        <Route path="/machineries/*" element={<Machineries />} />
        <Route path="/doc-track/*" element={<DocTrack/>} />
        <Route path="/auth/*" element={<Auth/>} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/system-admin/*" element={<SystemAdminApp />} />
      </Routes>
      </AutoRefreshErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
