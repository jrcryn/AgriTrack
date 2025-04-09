import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HighValueCrops from './Apps/highValueCropsApp.jsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/hvc/*" element={<HighValueCrops />} />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
