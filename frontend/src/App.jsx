import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HighValueCrops from './Apps/highValueCropsApp.jsx';
import Machineries from './Apps/machineriesApp.jsx'
import DocTrack from './Apps/docTrackApp.jsx'
import Auth from './Apps/authApp.jsx'

const queryClient = new QueryClient();

if (process.env.NODE_ENV === 'production') {
  console.log(
    '%c🚫 Warning!',
    'color: red; font-size: 24px; font-weight: bold;'
  );
  console.log(
    '%cAny attempt to tamper with the system may be logged.',
    'font-size: 14px; font-style: italic; color: red;'
  );
  console.warn = () => {};
  console.error = () => {};
}


function App() {

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
