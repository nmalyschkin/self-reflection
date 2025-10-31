import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import App from './App.tsx';
import './components/mdtext.scss';
// import { mockAPI } from './mocks/API';

// Initialize AI API mocks in development to enable full app behavior
// if (import.meta.env.DEV) {
//   mockAPI();
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
);
