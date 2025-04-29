import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HighValueCrops from './Apps/highValueCropsApp.jsx';
import Machineries from './Apps/machineriesApp.jsx'
import DocTrack from './Apps/docTrackApp.jsx'

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/hvc/*" element={<HighValueCrops />} />
        <Route path="/machineries/*" element={<Machineries />} />
        <Route path="/doc-track/*" element={<DocTrack/>} />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
