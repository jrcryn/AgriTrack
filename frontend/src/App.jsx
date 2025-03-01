import { Routes, Route } from 'react-router-dom';

import FormApp from './Apps/formApp';
function App() {
  
  return (
   <Routes>
      <Route path="/*" element={<FormApp/>} />
    </Routes>
  )
}

export default App
