import { Routes, Route } from 'react-router-dom';

import FormApp from './Apps/formApp';
import AdminApp from './Apps/adminApp';
function App() {
  
  return (
   <Routes>
      <Route path="/form/*" element={<FormApp/>} />
      <Route path="/admin" element={<AdminApp/>} />
    </Routes>
  )
}

export default App
