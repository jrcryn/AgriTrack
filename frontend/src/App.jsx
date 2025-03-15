import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


import FormApp from './Apps/formApp';
import AdminApp from './Apps/adminApp';
function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/form/*" element={<FormApp/>} />
        <Route path="/admin/*" element={<AdminApp/>} />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
