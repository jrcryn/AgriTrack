import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import NetworkStatusAlert from './components/networkStatusAlert.jsx'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        {/* <NetworkStatusAlert /> */}
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>,
)
