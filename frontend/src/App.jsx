import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HighValueCrops from './Apps/highValueCropsApp.jsx';
import Machineries from './Apps/machineriesApp.jsx'
import DocTrack from './Apps/docTrackApp.jsx'
import Auth from './Apps/authApp.jsx'

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/agritrack/hvc/*" element={<HighValueCrops />} />
        <Route path="/agritrack/machineries/*" element={<Machineries />} />
        <Route path="/agritrack/doc-track/*" element={<DocTrack/>} />
        <Route path="/agritrack/auth/*" element={<Auth/>} />``
      </Routes>
    </QueryClientProvider>
  )
}

export default App
